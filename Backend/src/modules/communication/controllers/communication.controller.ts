import { Controller, Post, Body, Request, Get, Param, Query } from '@nestjs/common';
import { ChatsService } from '../services/communication.service';
import { CreateChatDto } from '../dto/create-chat.dto';
import { GetChatDto } from '../dto/get-chat.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Chats')  // Swagger tag for documentation
@Controller('chats')
export class ChatsController {
constructor(private readonly chatsService: ChatsService) {}


@Post()
async createChat(
    @Request() req: any,  
    @Body() createChatDto: CreateChatDto,
) {
    const senderId = req.user._id; 
    return this.chatsService.create(senderId, createChatDto);  
}


@Get(':courseId')
async getChats(
    @Param('courseId') courseId: string,  // Extract courseId from URL params
    @Query() getChatDto: GetChatDto,  // Get query parameters (last_id, limit)
) {
    return this.chatsService.findAll(courseId, getChatDto);  // Pass courseId and pagination data to service
}
}
