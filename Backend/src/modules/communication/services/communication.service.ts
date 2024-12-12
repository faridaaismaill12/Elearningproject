import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../schemas/chat-schema';
import { CreateChatDto } from '../dto/create-chat.dto';
import { AddMessageDto } from '../dto/add-message.dto';
import { UserDocument } from '../../user/schemas/user.schema';
import { CourseDocument } from '../../course/schemas/course.schema';

@Injectable()
export class CommunicationService {
    
    constructor(
        @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
        @InjectModel('User') private userModel: Model<UserDocument>,
        @InjectModel('Course') private courseModel: Model<CourseDocument>// Replace 'any' with the appropriate User model type
    ) { }

    async createChat(createChatDto: CreateChatDto): Promise<ChatDocument> {
        console.log('createChatDto received:', createChatDto);
    
        if (!createChatDto.participants || !Array.isArray(createChatDto.participants)) {
            throw new Error('Participants array is missing or invalid.');
        }
    
        // Check if a chat with the same participants already exists
        for (const participantId of createChatDto.participants) {
            const participantChat = await this.getChatByParticipants([
                new Types.ObjectId(participantId),
                new Types.ObjectId(createChatDto.courseId),
            ]);
    
            if (participantChat) {
                throw new Error('Chat room already exists');
            }
        }
    
        // Create the chat
        const chat = new this.chatModel({
            type: createChatDto.type,
            participants: createChatDto.participants.map((id) => new Types.ObjectId(id)),
            courseId: new Types.ObjectId(createChatDto.courseId),
            title: createChatDto.title,
        });
    
        const savedChat = await chat.save();
    
        // Update users' chats array
        for (const participantId of createChatDto.participants) {
            await this.userModel.findByIdAndUpdate(
                participantId,
                { $addToSet: { chats: savedChat._id } }, // Use $addToSet to prevent duplicates
                { new: true }
            );
        }
    
        // Update course's chats array
        await this.courseModel.findByIdAndUpdate(
            createChatDto.courseId,
            { $addToSet: { chats: savedChat._id } }, // Use $addToSet to prevent duplicates
            { new: true }
        );
    
        console.log('Chat created and added to user and course chats arrays:', savedChat);
    
        return savedChat;
    }
    


    getChatByParticipants(participants: Types.ObjectId[]) {
        return this.chatModel.findOne({
            participants: { $all: participants }, // Ensure all participants are present
            $expr: { $eq: [{ $size: "$participants" }, participants.length] }, // Ensure exact count matches
        });
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

    //isParticipantInChat to check if the participant is in the chat
    async isParticipantInChat(chatId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
        const chat = await this.chatModel
            .findById(chatId)
            .populate('participants', '_id');
        if (!chat) {
            throw new NotFoundException('Chat room not found');
        }
        return chat.participants.some((participant) => participant._id.equals(userId));
    }
        

}
