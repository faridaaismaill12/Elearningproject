import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
//import { UseGuards } from '@nestjs/common';
//import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Types } from 'mongoose';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
//@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly chatService: ChatService) {}

    @WebSocketServer()
    server!: Server; // ! tells TypeScript that server will be initialized

    private readonly userSockets = new Map<string, string>();

    async handleConnection(client: Socket) {
        const userId = client.data.user._id;
        this.userSockets.set(userId.toString(), client.id);
        
        // Join all chat rooms where user is a participant
        const userChats = await this.chatService.getUserChats(userId);
        userChats.forEach(chat => {
            client.join(`chat-${chat._id}`);
        });
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.user._id;
        this.userSockets.delete(userId.toString());
    }

    @SubscribeMessage('joinChat')
    handleJoinChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() chatId: string,
    ) {
        client.join(`chat-${chatId}`);
    }

    @SubscribeMessage('leaveChat')
    handleLeaveChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() chatId: string,
    ) {
        client.leave(`chat-${chatId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string; message: CreateMessageDto },
    ) {
        const userId = client.data.user._id;
        try {
            const chat = await this.chatService.addMessage(
                data.chatId,
                userId,
                data.message,
            );
            
            this.server.to(`chat-${data.chatId}`).emit('newMessage', {
                chatId: data.chatId,
                message: {
                    sender: userId,
                    content: data.message.content,
                    timestamp: new Date(),
                },
            });

            return chat;
        } catch (error) {
            client.emit('error', {
                message: (error as Error).message,
            });
        }
    }
}