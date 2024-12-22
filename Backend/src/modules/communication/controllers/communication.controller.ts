import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommunicationService } from '../services/communication.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/role.guard';
import { AddMessageDto } from '../dto/add-message.dto';
import { CreateChatDto } from '../dto/create-chat.dto';

@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  /**
   * Get chat history for a specific chat room
   */
  @Get('chat-history/:chatId')
  async getChatHistory(@Param('chatId') chatRoomId: string) {
    return this.communicationService.getChatHistory(new Types.ObjectId(chatRoomId));
  }

  /**
   * Get all chats for the current user
   */
  @Get('chats')
  async getChats(@Req() req: any) {
    const userId = req.user.id; // Extract user ID from token
    return this.communicationService.getUserChats(new Types.ObjectId(userId));
  }

  /**
   * Create a 1:1 chat
   */
  @Post('create-one-to-one-chat')
  async createOneToOneChat(
    @Body() body: { recipientId: string; courseId: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const createChatDto: CreateChatDto = {
      type: 'private',
      participants: [new Types.ObjectId(userId), new Types.ObjectId(body.recipientId)],
      title: `Chat between ${userId} and ${body.recipientId}`,
      courseId: new Types.ObjectId(body.courseId),
    };

    return this.communicationService.createChat(createChatDto);
  }

  /**
   * Create a group chat
   */
  @Post('create-group-chat')
  async createGroupChat(
    @Body() body: { participantIds: string[]; courseId: string; title: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;

    const createChatDto: CreateChatDto = {
      type: 'group',
      participants: [
        new Types.ObjectId(userId),
        ...body.participantIds.map((id) => new Types.ObjectId(id)),
      ],
      title: body.title,
      courseId: new Types.ObjectId(body.courseId),
    };

    return this.communicationService.createChat(createChatDto);
  }

  /**
   * Send a message to a chat
   */
  @Post('send-message')
  async sendMessage(@Body() body: { chatRoomId: string; content: string }, @Req() req: any) {
    const userId = req.user.id;

    const addMessageDto: AddMessageDto = {
      chatRoomId: new Types.ObjectId(body.chatRoomId),
      sender: new Types.ObjectId(userId),
      content: body.content,
    };

    return this.communicationService.addMessage(addMessageDto);
  }
}
