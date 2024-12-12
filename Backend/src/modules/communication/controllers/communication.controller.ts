import { Controller, Get, Param } from '@nestjs/common';
import { CommunicationService } from '../services/communication.service';
import { Types } from 'mongoose';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get('chat-history/:chatRoomId')
  async getChatHistory(@Param('chatRoomId') chatRoomId: string) {
    return this.communicationService.getChatHistory(new Types.ObjectId(chatRoomId));
  }
}
