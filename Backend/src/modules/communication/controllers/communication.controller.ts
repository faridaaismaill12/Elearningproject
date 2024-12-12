import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { CommunicationService } from '../services/communication.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/role.guard';

@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get('chat-history/:chatRoomId')
  async getChatHistory(@Param('chatRoomId') chatRoomId: string) {
    return this.communicationService.getChatHistory(new Types.ObjectId(chatRoomId));
  }

  //get all chats for a user

  @Get('chats')
  async getChats(@Req() req: any) {
    const userId = req.user.id; // Extract user ID from token
    return this.communicationService.getUserChats(new Types.ObjectId(userId));
  }
}
