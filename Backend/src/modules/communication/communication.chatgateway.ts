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
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
@Injectable()
export class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    emitNotification(studentId: Types.ObjectId, arg1: Notification) {
        throw new Error('Method not implemented.');
    }
    @WebSocketServer()
    server!: Server;

    private activeUsers: Map<string, string> = new Map(); // Maps userId to socketId

    constructor(
        private readonly communicationService: CommunicationService,
        private readonly configService: ConfigService,
        private readonly courseService: CourseService,
        private readonly userService: UserService,
    ) {}

    /**
     * Validate and decode JWT token.
     */
    private validateToken(client: Socket): string {
        const token = client.handshake.headers.authorization?.split(' ')[1] || client.handshake.query.token as string;

        if (!token) {
            throw new UnauthorizedException('Authentication token is required.');
        }

        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('JWT secret is not defined.');
        }

        const decoded: any = jwt.verify(token, secret);
        console.log('Decoded token:', decoded);

        if (!decoded.id) {
            throw new UnauthorizedException('Invalid token: Missing userId.');
        }

        return decoded.id;
    }

    /**
     * Handle connection with token validation.
     */
    async handleConnection(client: Socket) {
        try {
            const userId = this.validateToken(client);
            this.activeUsers.set(userId, client.id);
            console.log(`User ${userId} connected with socket ID ${client.id}`);
        } catch (error: unknown) {
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

            const userId = this.validateToken(client);

            // Parse participants from JSON
            const participantsArray = Array.isArray(body.participants)
                ? body.participants
                : Object.values(body.participants || {});

            // Add the current user to the participants list
            if (!participantsArray.includes(userId)) {
                participantsArray.push(userId);
            }

            console.log('Constructed participantsArray:', participantsArray);

            const type = participantsArray.length > 2 ? 'group' : 'private';

            // Validate course enrollment
            const courseId = body.courseId;
            if (!courseId) {
                throw new Error('Course ID is required.');
            }

            const course = await this.courseService.findCourseById(courseId);
            if (!course) {
                throw new Error('Course not found.');
            }

            const enrolledUsers = course.enrolledStudents?.map((user: any) => user.toString()) || [];
            const allParticipantsEnrolled = participantsArray.every((participant: string) =>
                enrolledUsers.includes(participant),
            );

            if (!allParticipantsEnrolled) {
                throw new Error('Some participants are not enrolled in the course.');
            }

            //loop on the participantsArray to check the role of the user
            for (const participant of participantsArray) {
                const userRole = await this.userService.getUserRole(participant);
                if (userRole === 'admin') {
                    throw new Error(' Can not add admins to chat.');
                }
                
            }

            let title = course.courseId+':';
            if (participantsArray.length === 2) {
                let i=0;
                
                for (const participant of participantsArray) {
                    // Get username by id
                    const username = await this.userService.getUserName(participant);
                    if (username) {
                        if( i===1)
                        {
                            title += '+'
                        }
                        title +=username; // Safely concatenate usernames
                    }
                    i++;
                }
            }else{
                title += '_' + body.title; 
            }
            
            const roomName= title || 'Chat Room';


            const createChatDto: CreateChatDto = {
                type: type as 'private' | 'group',
                title:roomName,
                participants: participantsArray.map((participant: Types.ObjectId) => new Types.ObjectId(participant)),
                courseId,
            };

            // Check if a chat with the same participants already exists
            const existingChat = await this.communicationService.getChatByParticipants(createChatDto.participants);
            if (existingChat) {
                console.log('Chat room already exists:', existingChat._id);
                client.emit('chatCreatedAck', { success: true, chatRoomId: existingChat._id });
                return;
            }

            // Create the chat
            const newChat = await this.communicationService.createChat(createChatDto);

            // Notify all participants
            newChat.participants.forEach((participant) => {
                const socketId = this.activeUsers.get(participant.toString());
                if (socketId) {
                    this.server.to(socketId).emit('chatCreated', {
                        chatRoomId: newChat._id,
                        type: newChat.type,
                        participants: newChat.participants,
                        courseId: newChat.courseId,
                        messages: newChat.messages || [],
                    });
                    console.log(`Sent chatCreated to participant: ${participant.toString()}`);
                }
            });

            // Acknowledge the initiator
            client.emit('chatCreatedAck', { success: true, chatRoomId: newChat._id });
        } catch (error: unknown) {
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
            const userId = this.validateToken(client);

            console.log('Received sendMessage event with payload:', body);

            if (!body || !body.chatRoomId || !body.content) {
                console.error('Invalid payload format. Missing required fields.');
                client.emit('error', { message: 'Invalid payload format. Missing required fields.' });
                return;
            }

            //make sure that the user is participant in the chat
            if (!this.communicationService.isParticipantInChat(new Types.ObjectId(body.chatRoomId), new Types.ObjectId(userId))) {
                console.error(`User ${userId} is not a participant of chat room ${body.chatRoomId}`);
                client.emit('error', { message: 'You are not authorized to send messages in this chat room.' });
                return;
            }

            const addMessageDto: AddMessageDto = {
                chatRoomId: body.chatRoomId,
                sender: new Types.ObjectId(userId),
                content: body.content,
            };


            const chat = await this.communicationService.getChatHistory(new Types.ObjectId(body.chatRoomId));
            const isParticipant = chat.participants.some((participant) => participant._id.equals(new Types.ObjectId(userId)));

            if (!isParticipant) {
                console.error(`User ${userId} is not a participant of chat room ${addMessageDto.chatRoomId}`);
                client.emit('error', { message: 'You are not authorized to send messages in this chat room.' });
                return;
            }

            const updatedChat = await this.communicationService.addMessage(addMessageDto);

            console.log('Message saved to database. Broadcasting to participants...');

            updatedChat.participants.forEach((participant) => {
                const socketId = this.activeUsers.get(participant.toHexString());
                if (socketId && participant.toHexString() !== userId) {
                    console.log(`Emitting to socket ID ${socketId} for participant ${participant.toHexString()}`);
                    this.server.to(socketId).emit('receiveMessage', {
                        chatRoomId: body.chatRoomId,
                        sender: userId,
                        content: body.content,
                        timestamp: new Date(),
                    });
                }
            });

            client.emit('messageSent', { success: true });
            console.log(`Acknowledgment sent to sender: ${client.id}`);
        } catch (error: unknown) {
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
