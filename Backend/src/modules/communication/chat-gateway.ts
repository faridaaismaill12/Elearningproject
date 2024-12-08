import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatsService } from './services/communication.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';


@WebSocketGateway(3002, {
namespace: '/chats',
})
export class ChatsGateway {


constructor(private readonly chatsService: ChatsService,
    private readonly jwtService: JwtService,
) { }

@WebSocketServer()
private server!: Server;

@SubscribeMessage('create')
@UseGuards(JwtAuthGuard)
async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createChatDto: CreateChatDto
) {
    const senderId = this.jwtService.decode(client.handshake.auth.token)['sub'];
    return this.chatsService.create(senderId, createChatDto);
}

afterInit(client: Socket) {
   // client.use((socket, next) => wsAuthMiddleware(socket, next));
}
}