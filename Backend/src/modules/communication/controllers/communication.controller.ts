import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CommunicationService } from '../services/communication.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { RolesGuard } from '../../security/guards/role.guard';
import { AddMessageDto } from '../dto/add-message.dto';
import { CreateChatDto } from '../dto/create-chat.dto';
import { CourseService } from '../../course/course.service';
import { UserService } from '../../user/user.service';

@Controller('communication')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService,
              private readonly courseService: CourseService,
              private readonly userService: UserService,
  ) {}

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
  
    // Prevent creating a chat with yourself
    if (userId === body.recipientId) {
      throw new Error('You cannot create a chat with yourself.');
    }
  
    // Fetch the course name
    const course = await this.courseService.findCourseById(body.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  
    // Fetch usernames for both participants
    const [sender, recipient] = await Promise.all([
      this.userService.findUserById(userId),
      this.userService.findUserById(body.recipientId),
    ]);
  
    if (!sender || !recipient) {
      throw new NotFoundException('One or both users not found.');
    }
  
    // Check for existing 1:1 chat between the same participants in the same course
    const existingChat = await this.communicationService.getChatByParticipantsAndCourse(
      [new Types.ObjectId(userId), new Types.ObjectId(body.recipientId)],
      new Types.ObjectId(body.courseId),
    );
  
    if (existingChat) {
      throw new Error('A 1:1 chat already exists between these participants in this course.');
    }
  
    const chatTitle = `${course.title}:${sender.name}+${recipient.name}`;
  
    const createChatDto: CreateChatDto = {
      type: 'private',
      participants: [new Types.ObjectId(userId), new Types.ObjectId(body.recipientId)],
      title: chatTitle,
      courseId: new Types.ObjectId(body.courseId),
    };
  
    return this.communicationService.createChat(createChatDto);
  }
  
  @Post('create-group-chat')
  async createGroupChat(
    @Body() body: { participantIds: string[]; courseId: string; title: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
  
    // Prevent creating a group chat with only yourself
    const uniqueParticipants = Array.from(new Set(body.participantIds));
    if (uniqueParticipants.length === 0 || (uniqueParticipants.length === 1 && uniqueParticipants[0] === userId)) {
      throw new Error('You cannot create a group chat with only yourself.');
    }
  
    const course = await this.courseService.findCourseById(body.courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  
    // Check for existing group chat with the same participants in the same course
    const participants = [
      new Types.ObjectId(userId),
      ...uniqueParticipants.map((id) => new Types.ObjectId(id)),
    ];
  
    const existingChat = await this.communicationService.getChatByParticipantsAndCourse(
      participants,
      new Types.ObjectId(body.courseId),
    );
  
    if (existingChat) {
      throw new Error('A group chat with these participants already exists in this course.');
    }
  
    const chatTitle = `${course.title}: ${body.title}`;
  
    const createChatDto: CreateChatDto = {
      type: 'group',
      participants,
      title: chatTitle,
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
