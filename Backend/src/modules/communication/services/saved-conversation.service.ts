import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SavedConversation, SavedConversationDocument } from '../schemas/saved-conversation.schema';

@Injectable()
export class SavedConversationService {
    constructor(
        @InjectModel(SavedConversation.name)
        private savedConversationModel: Model<SavedConversationDocument>,
    ) {}

    async saveConversation(
        userId: string,
        title: string,
        messages: Array<{ sender: string; message: string; timestamp?: Date }>,
    ): Promise<SavedConversation> {
        const conversation = new this.savedConversationModel({
            user: new Types.ObjectId(userId),
            title,
            messages: messages.map((msg) => ({
                sender: new Types.ObjectId(msg.sender),
                message: msg.message,
                timestamp: msg.timestamp || new Date(),
            })),
        });
        return conversation.save();
    }

    async getConversationById(id: string): Promise<SavedConversation> {
        const conversation = await this.savedConversationModel
            .findById(id)
            .populate('user')
            .populate('messages.sender')
            .exec();
        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        return conversation;
    }

    async getUserConversations(userId: string): Promise<SavedConversation[]> {
        return this.savedConversationModel
            .find({ user: new Types.ObjectId(userId), isActive: true })
            .populate('user')
            .exec();
    }

    async deleteConversation(id: string): Promise<{ message: string }> {
        const result = await this.savedConversationModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('Conversation not found');
        }
        return { message: 'Conversation deleted successfully' };
    }

    async saveMessage(
        conversationId: string,
        message: { sender: string; message: string; timestamp?: Date },
    ): Promise<void> {
        await this.savedConversationModel.findByIdAndUpdate(
            conversationId,
            {
                $push: {
                    messages: {
                        sender: new Types.ObjectId(message.sender),
                        message: message.message,
                        timestamp: message.timestamp || new Date(),
                    },
                },
            },
            { new: true },
        ).exec();
    }

    async createConversation(data: { userId: string; title: string; messages: any[] }) {
        const newConversation = new this.savedConversationModel({
            userId: new Types.ObjectId(data.userId),
            title: data.title,
            messages: data.messages,
        });
        return await newConversation.save();
    }
    
    
    
}
