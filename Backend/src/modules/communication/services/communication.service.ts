import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../schemas/chat-schema';
import { CreateChatDto } from '../dto/create-chat.dto';
import { AddMessageDto } from '../dto/add-message.dto';

@Injectable()
export class CommunicationService {
    constructor(@InjectModel(Chat.name) private chatModel: Model<ChatDocument>) { }

    async createChat(createChatDto: CreateChatDto): Promise<ChatDocument> {
        console.log('createChatDto received:', createChatDto); // Add this log

        if (!createChatDto.participants || !Array.isArray(createChatDto.participants)) {
            throw new Error('Participants array is missing or invalid.');
        }

        const chat = new this.chatModel({
            type: createChatDto.type,
            participants: createChatDto.participants.map((id) => new Types.ObjectId(id)),
            courseId: new Types.ObjectId(createChatDto.courseId),
        });

        return chat.save();
    }



    async addMessage(addMessageDto: AddMessageDto): Promise<Chat> {
        const chat = await this.chatModel.findById(addMessageDto.chatRoomId);
        if (!chat) {
            throw new NotFoundException('Chat room not found');
        }
        if (!chat.messages) {
            chat.messages = [];
        }
        chat.messages.push({
            sender: addMessageDto.sender.toString(),
            content: addMessageDto.content,
            timestamp: new Date(),
        });
        return chat.save();
    }
    
    


    async getChatHistory(chatRoomId: Types.ObjectId): Promise<ChatDocument> {
        const chat = await this.chatModel
            .findById(chatRoomId)
            .populate('participants', '_id name')
            .populate('courseId', '_id title');

        if (!chat) {
            throw new NotFoundException('Chat room not found');
        }

        return chat;
    }
}
