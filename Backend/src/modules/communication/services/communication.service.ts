import { Injectable } from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from '../schemas/chat-schema';
import { Model } from 'mongoose';
import { GetChatDto } from '../dto/get-chat.dto';
import { Course } from '../../course/schemas/course.schema';  // Import the Course schema
import { NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../../user/schemas/user.schema';  // Import the User schema


@Injectable()
export class ChatsService {
constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Course.name) private courseModel: Model<Course>,  // Inject Course model
    @InjectModel(User.name) private userModel: Model<UserDocument>,  // Inject User model
) {}


async create(senderId: string, createChatDto: CreateChatDto) {
  const sender = await this.userModel.findById(senderId);
  if (!sender) throw new NotFoundException('User not found');
  const createdChat = new this.chatModel({
    ...createChatDto,
    sender_id: senderId,
    sender_name: sender.name,
    role: sender.role,  // Add role to the chat
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
