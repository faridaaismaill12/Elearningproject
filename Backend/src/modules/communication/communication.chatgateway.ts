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
import { Types } from 'mongoose';
import { CourseService } from '../course/course.service';
import { UserService } from '../user/user.service';
import { NotificationService } from './services/notification.service';

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
        private readonly configService: ConfigService,
        private readonly courseService: CourseService,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
    ) {}

    /**
     * Validate and decode JWT token.
     */
    private validateToken(client: Socket): string {
        const token = client.handshake.headers.authorization?.split(' ')[1] || (client.handshake.query.token as string);

        if (!token) {
            throw new UnauthorizedException('Authentication token is required.');
        }

        const secret = this.configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('JWT secret is not defined.');
        }

        const decoded: any = jwt.verify(token, secret);
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
        } catch (error) {
            console.error('Connection error:', (error as Error).message);
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
     * Handle sendMessage event.
     */
    @SubscribeMessage('sendMessage')
    async handleSendMessage(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
        try {
            const userId = this.validateToken(client);

            // Validate payload
            if (!body || !body.chatRoomId || !body.content) {
                client.emit('error', { message: 'Invalid payload format. Missing required fields.' });
                return;
            }

            const addMessageDto = {
                chatRoomId: body.chatRoomId,
                sender: new Types.ObjectId(userId),
                content: body.content,
            };

            // Fetch chat history and validate participation
            const chat = await this.communicationService.getChatHistory(new Types.ObjectId(body.chatRoomId));
            const isParticipant = chat.participants.some((participant) =>
                participant._id.equals(new Types.ObjectId(userId)),
            );

            if (!isParticipant) {
                client.emit('error', { message: 'You are not authorized to send messages in this chat room.' });
                return;
            }

            // Save the message in the chat
            const updatedChat = await this.communicationService.addMessage(addMessageDto);

            // Notify other participants in the chat
            for (const participant of updatedChat.participants) {
                const participantId = participant.toHexString();
                const socketId = this.activeUsers.get(participantId);

                // Skip sender
                if (participantId !== userId) {
                    // Save notification to the database
                    const notification = await this.notificationService.createNotification(
                        participantId,
                        `${await this.userService.getUserName(userId)} sent a message in ${chat.title}.`,
                        'MESSAGE',
                    );

                    // Emit real-time notification to the recipient if online
                    if (socketId) {
                        this.server.to(socketId).emit('newNotification', notification);
                        console.log(`Real-time notification sent to user ${participantId}`);
                    }
                }
            }

            // Acknowledge message sent
            client.emit('messageSent', { success: true });
            console.log(`Message sent by user ${userId} in chat room ${body.chatRoomId}`);
        } catch (error) {
            console.error('Error handling sendMessage event:', (error as Error).message);
            client.emit('error', { message: (error as Error).message });
        }
    }

    async emitNotification(recipient: string | Types.ObjectId, notification: Notification) {
        const recipientSocketId = this.activeUsers.get(recipient.toString());
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('newNotification', notification);
        }
      }
}
