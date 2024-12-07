import { Injectable } from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from '../schemas/chat-schema';
import { Model } from 'mongoose';
import { GetChatDto } from '../dto/get-chat.dto';
import { Course } from '../../course/schemas/course.schema';  // Import the Course schema

@Injectable()
export class ChatsService {
constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,  // Inject Course model
) {}

async create(senderId: string, createChatDto: CreateChatDto) {
    const createdChat = new this.chatModel
    ({
    ...createChatDto,
      sender_id: senderId,  // Set the user id to the sender id
    });

    return createdChat.save();
}


async findAll(courseId: string, getChatDto: GetChatDto) {
    const query: { courseId: string; _id?: { $lt: string } } = {
      courseId: courseId,  // Filter messages by the course
    };
    if (getChatDto.last_id) {
    query['_id'] = { $lt: getChatDto.last_id };
    }

    return this.chatModel
    .find(query)
      .sort({ createdAt: -1 })  // Sort by creation date 
      .limit(getChatDto.limit);  // Limit the number of messages returned
}
}
