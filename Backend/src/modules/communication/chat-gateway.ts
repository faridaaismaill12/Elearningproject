import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './services/communication.service';

@WebSocketGateway({
    namespace: 'chat',
    cors: {
    origin: '*',
    },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;

    constructor(private readonly chatService: ChatService) {}

    afterInit(server: Server) {
    console.log('WebSocket initialized');
    }

    handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, chatId: string): Promise<void> {
    client.join(chatId);
    console.log(`Client ${client.id} joined room ${chatId}`);
    }
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { chatId: string; senderId: string; content: string }): Promise<void> {
    const message = await this.chatService.createMessage(payload.chatId, payload.senderId, payload.content);
    this.server.to(payload.chatId).emit('message', message);
    }
}
