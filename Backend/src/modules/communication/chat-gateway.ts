import {
SubscribeMessage, 
WebSocketGateway,
OnGatewayConnection,
OnGatewayDisconnect, 
WebSocketServer} from '@nestjs/websockets'; 
import { Socket, Server } from 'socket.io';

@WebSocketGateway(3002, {})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

handleConnection(client: Socket) {
    console.log("New client connected", client.id); 
}

handleDisconnect(client: Socket) {
    console.log("Client disconnected", client.id);
}

    // we need to listen to the message event
    @SubscribeMessage('newMessage')
    handleNewMessage(client: Socket, message: any) {
        // we need to log the message
        console.log( message);
    }
}

//socket.on() //listen to the event
//io.emit() //broadcast
//socket.emit() //send to the client
