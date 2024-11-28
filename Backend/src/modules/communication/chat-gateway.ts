import {
SubscribeMessage, 
WebSocketGateway,
OnGatewayConnection,
OnGatewayDisconnect, 
WebSocketServer,
MessageBody} from '@nestjs/websockets'; 
import { Socket, Server } from 'socket.io';
import { chatDocument } from './schemas/chat-schema';

@WebSocketGateway(3002, {})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    



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
    }
}

//socket.on() //listen to the event
//io.emit() //broadcast
//socket.emit() //send to the client
