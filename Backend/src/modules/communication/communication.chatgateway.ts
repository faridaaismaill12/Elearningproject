import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommunicationService } from './services/communication.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { CreateChatDto } from './dto/create-chat.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { Types } from 'mongoose';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private activeUsers: Map<string, string> = new Map(); // Maps userId to socketId

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly configService: ConfigService, // For accessing JWT secret
    ) {}

    /**
     * Handle connection with token validation.
     */
    async handleConnection(client: Socket) {
        try {
            // Retrieve token from headers or query
            const token = client.handshake.headers.authorization?.split(' ')[1] || client.handshake.query.token as string;

            if (!token) {
                throw new UnauthorizedException('Authentication token is required.');
            }

            // Validate and decode the token
            const secret = this.configService.get<string>('JWT_SECRET');
            if (!secret) {
                throw new UnauthorizedException('JWT secret is not defined.');
            }
            const decoded: any = jwt.verify(token, secret);
            console.log('Decoded token:', decoded);

            const userId = decoded.id;
            if (!userId) {
                throw new UnauthorizedException('Invalid token: Missing userId.');
            }

            // Map userId to socketId
            this.activeUsers.set(userId, client.id);
            console.log(`User ${userId} connected with socket ID ${client.id}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Authentication failed:', error.message);
            } else {
                console.error('Authentication failed:', error);
            }
            client.emit('error', { message: 'Authentication failed. Invalid or missing token.' });
            client.disconnect();
        }
    }

    /**
     * Handle disconnection.
     */
    handleDisconnect(client: Socket) {
        for (const [userId, socketId] of this.activeUsers.entries()) {
            if (socketId === client.id) {
                this.activeUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    }

    /**
     * Handle create chat event.
     */
    @SubscribeMessage('createChat')
    async handleCreateChat(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        try {
            console.log('Raw payload received:', body);

            // Parse payload
            const createChatDto: CreateChatDto = {
                type: body.type,
                participants: body.participants,
                courseId: body.courseId,
            };

            // Validate participants
            if (!createChatDto.participants || !Array.isArray(createChatDto.participants)) {
                throw new Error('Invalid participants format. Must be an array of user IDs.');
            }

            // Create chat
            const newChat = await this.communicationService.createChat(createChatDto);

            // Notify participants
            newChat.participants.forEach((participant) => {
                const socketId = this.activeUsers.get(participant.toHexString());
                if (socketId) {
                    this.server.to(socketId).emit('chatCreated', {
                        chatRoomId: newChat._id,
                        type: newChat.type,
                        participants: newChat.participants,
                        courseId: newChat.courseId,
                        messages: newChat.messages || [],
                    });
                    console.log(`Sent chatCreated to participant: ${participant.toHexString()}`);
                }
            });

            // Acknowledge the initiator
            client.emit('chatCreatedAck', { success: true, chatRoomId: newChat._id });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error creating chat:', error.message);
                client.emit('error', { message: error.message });
            } else {
                console.error('Error creating chat:', error);
                client.emit('error', { message: 'An unknown error occurred.' });
            }
        }
    }

    /**
     * Handle send message event.
     */
    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        try {

            const token = client.handshake.headers.authorization?.split(' ')[1] || client.handshake.query.token as string;

            if (!token) {
                throw new UnauthorizedException('Authentication token is required.');
            }

            // Validate and decode the token
            const secret = this.configService.get<string>('JWT_SECRET');
            if (!secret) {
                throw new UnauthorizedException('JWT secret is not defined.');
            }
            const decoded: any = jwt.verify(token, secret);
            console.log('Decoded token:', decoded);

            const userId = decoded.id;
            if (!userId) {
                throw new UnauthorizedException('Invalid token: Missing userId.');
            }

            console.log('Received sendMessage event with payload:', body);

            // Check if `body` is an array and extract the first element
            if (Array.isArray(body)) {
                console.error('Received payload as an array. Extracting first element...');
                body = body[0];
            }
        
            // Log the extracted `body` for debugging
            console.log('Parsed body after array handling:', body);
        
            // Validate the payload
            if (!body || !body.chatRoomId || !body.content) {
                console.error('Invalid payload format. Missing required fields.');
                client.emit('error', { message: 'Invalid payload format. Missing required fields.' });
                return;
            }
        
            try {
                const addMessageDto: AddMessageDto = {
                    chatRoomId: body.chatRoomId,
                    sender: userId,
                    content: body.content,
                };
        
                // Fetch the chat room and validate the sender
                const chat = await this.communicationService.getChatHistory(new Types.ObjectId(body.chatRoomId));
                const isParticipant = chat.participants.some(
                    (participant) => participant._id.equals(new Types.ObjectId(addMessageDto.sender)),
                );
        
                if (!isParticipant) {
                    console.error(`User ${addMessageDto.sender} is not a participant of chat room ${addMessageDto.chatRoomId}`);
                    client.emit('error', { message: 'You are not authorized to send messages in this chat room.' });
                    return;
                }
        
                // Save the message
                const updatedChat = await this.communicationService.addMessage(addMessageDto);
        
                console.log('Message saved to database. Broadcasting to participants...');
        
                // Broadcast the message to other participants
                updatedChat.participants.forEach((participant) => {
                    const socketId = this.activeUsers.get(participant.toHexString());
                    if (socketId && participant.toHexString() !== new Types.ObjectId(addMessageDto.sender).toHexString()) {
                        console.log(`Emitting to socket ID ${socketId} for participant ${participant.toHexString()}`);
                        this.server.to(socketId).emit('receiveMessage', {
                            chatRoomId: body.chatRoomId,
                            sender: body.sender,
                            content: body.content,
                            timestamp: new Date(),
                        });
                    }
                });
        
                // Acknowledge the sender
                client.emit('messageSent', { success: true });
                console.log(`Acknowledgment sent to sender: ${client.id}`);
            } catch (error) {
                console.error('Error while sending message:', (error as Error).message);
                client.emit('error', { message: (error as Error).message });
            }
        }
    
        catch (error) {
            if (error instanceof Error) {
                console.error('Error sending message:', error.message);
                client.emit('error', { message: error.message });
            } else {
                console.error('Error sending message:', error);
                client.emit('error', { message: 'An unknown error occurred.' });
            }
        }
    }
}
