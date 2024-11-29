import { 
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect, 
    WebSocketServer,
    MessageBody,
    SubscribeMessage} from '@nestjs/websockets'; 
    import { Socket, Server } from 'socket.io';
    // import { CommunicationService } from './services/communication.service';
    import { NotificationService } from '../communication/services/notification.service';
    import { Types } from 'mongoose';
    
    @WebSocketGateway(3002, {})
    export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
        
        @WebSocketServer()
        server!: Server;
    
        constructor(
            // private readonly communicationService: CommunicationService,
            private readonly notificationService: NotificationService
        ) {
            console.log('Chat Gateway is ready!');
        }
    
    handleConnection(client: Socket) { // we need to log the connection
        console.log("New client connected", client.id); 
    
        this.server.emit('user-joined', {
            message: `New user joined the Chat': ${client.id},`
        });
    }
    
    handleDisconnect(client: Socket) { // we need to log the disconnection
        console.log("Client disconnected", client.id);
    
        this.server.emit('user-left', {
            message: `User left the Chat': ${client.id},`
        });
    }
    // this method is used to make sure that every client in a groupchat sees that message
        @SubscribeMessage('newMessage')
        handleNewMessage(@MessageBody() message: string) {
            this.server.emit('newMessage', message); // we need to broadcast the message to all clients
            console.log('New message:', message);

            // socket.on() //listen to the event
            // io.emit() //broadcast
            // socket.emit()
        }
    }
    
    