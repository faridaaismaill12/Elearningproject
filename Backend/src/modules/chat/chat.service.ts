import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<Chat>,
    ) {}

    async createChat(createChatDto: CreateChatDto) {
        const chat = new this.chatModel({
            participants: createChatDto.participants,
            messages: [],
        });
        return chat.save();
    }

    async addMessage(chatId: string, userId: Types.ObjectId, createMessageDto: CreateMessageDto) {
        const chat = await this.chatModel.findById(chatId);
        
        if (!chat) {
            throw new NotFoundException('Chat not found');
        }

        if (!chat.participants.some(p => p.equals(userId))) {
            throw new ForbiddenException('User is not a participant in this chat');
        }
        if (!chat.messages) { // create empty message if not exist
            chat.messages = [];
        }
        chat.messages.push({
            sender: userId,
            content: createMessageDto.content,
            timestamp: new Date(),
        });

        return chat.save();
    }

    async getChat(chatId: string, userId: Types.ObjectId) {
        const chat = await this.chatModel
            .findById(chatId)
            .populate('participants', 'name email role')
            .populate('messages.sender', 'name email role');

        if (!chat) {
            throw new NotFoundException('Chat not found');
        }

        if (!chat.participants.some(p => p.equals(userId))) {
            throw new ForbiddenException('User is not a participant in this chat');
        }

        return chat;
    }

    async getUserChats(userId: Types.ObjectId) {
        return this.chatModel
            .find({ participants: userId })
            .populate('participants', 'name email role')
            .populate('messages.sender', 'name email role')
            .sort({ 'messages.timestamp': -1 });
    }
}