import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatDocument } from '../schemas/chat-schema';
import { MessageDocument } from '../schemas/message-schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<ChatDocument>,
    @InjectModel('Message') private readonly messageModel: Model<MessageDocument>,
  ) {}
  async createMessage(chatId: string, senderId: string, content: string): Promise<MessageDocument> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new BadRequestException('Chat not found');
    const message = new this.messageModel({
      content,
      sender: new Types.ObjectId(senderId),
      chat: new Types.ObjectId(chatId),
    });
    await message.save();
    chat.messages.push();
    await chat.save();
    return message.populate('sender', '-password');
  }
  async getMessages(chatId: string): Promise<MessageDocument[]> {
    return this.messageModel.find({ chat: chatId }).populate('sender', '-password').exec();
  }
}
