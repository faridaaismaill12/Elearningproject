import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { Types } from 'mongoose';

@Controller('chat')
//@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    createChat(@Body() createChatDto: CreateChatDto) {
        return this.chatService.createChat(createChatDto);
    }

    @Post(':chatId/messages')
    addMessage(
        @Param('chatId') chatId: string,
        @GetUser('_id') userId: Types.ObjectId,
        @Body() createMessageDto: CreateMessageDto,
    ) {
        return this.chatService.addMessage(chatId, userId, createMessageDto);
    }

    @Get(':chatId')
    getChat(
        @Param('chatId') chatId: string,
        @GetUser('_id') userId: Types.ObjectId,
    ) {
        return this.chatService.getChat(chatId, userId);
    }

    @Get('user/chats')
    getUserChats(@GetUser('_id') userId: Types.ObjectId) {
        return this.chatService.getUserChats(userId);
    }
}