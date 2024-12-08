import { Controller, Post, Body, Request, Get, Param, Query } from '@nestjs/common';
import { ChatsService } from '../services/communication.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { GetChatDto } from '../dto/get-chat.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
constructor(private readonly chatsService: ChatsService) {}

@Post()
async createChat(
    @Request() req: any,
    @Body() createChatDto: CreateChatDto,
) {
    const senderId = req.user._id; // Use the user ID from JWT token
    return this.chatsService.create(senderId, createChatDto);
}

@Get(':courseId')
async getChats(
@Param('courseId') courseId: string,
    @Query() getChatDto: GetChatDto,
) {
    return this.chatsService.findAll(courseId, getChatDto);
}
}
