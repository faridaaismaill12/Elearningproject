import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    MessageBody,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NotificationService } from '../communication/services/notification.service';
import { SavedConversationService } from '../communication/services/saved-conversation.service';
import { Types } from 'mongoose';

@WebSocketGateway(3002, {})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    // Array to store connected clients
    clients: { clientId: string; userId: string | null }[] = [];

    constructor(
        private readonly notificationService: NotificationService,
        private readonly savedConversationService: SavedConversationService // Inject SavedConversationService
    ) {
        console.log('Chat Gateway is ready!');
    }

    handleConnection(client: Socket) {
        console.log('New client connected', client.id);

        // Add client to the `clients` array with default userId as `null`
        this.clients.push({ clientId: client.id, userId: null });

        this.server.emit('user-joined', {
            message: `New user joined the chat: ${client.id}`,
        });
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected', client.id);

        // Remove client from the `clients` array
        this.clients = this.clients.filter((c) => c.clientId !== client.id);

        this.server.emit('user-left', {
            message: `User left the chat: ${client.id}`,
        });
    }

    @SubscribeMessage('identify')
    handleIdentify(client: Socket, userId: string) {
        console.log('Identifying user:', client.id, userId);

        // Update the user's information in the `clients` array
        const user = this.clients.find((c) => c.clientId === client.id);
        if (user) {
            user.userId = userId;
        }
    }

    @SubscribeMessage('newMessage')
    async handleNewMessage(
        @MessageBody() data: { message: string; userId: string }
    ) {
        const { message, userId } = data;

        console.log('New message received:', data);

        let conversation;

        const conversationId = new Types.ObjectId();

        // Create a new conversation if none exists
        console.log('Creating a new conversation...');
        conversation = await this.savedConversationService.createConversation({
            userId,
            title: 'New Conversation',
            messages: [],
        });

        // Save the message to the conversation
        await this.savedConversationService.saveMessage(conversationId.toString(), {
            sender: userId,
            message,
        });

        // Broadcast the message to all connected clients
        this.server.emit('newMessage', { ...data, conversationId: conversation._id });
    }
}
