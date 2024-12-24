import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';
import { JwtAuthGuard } from '../../security/guards/jwt-auth.guard';
import { ForumThread, Reply } from '../schemas/forum-thread.schema';
import { Types } from 'mongoose';

@Controller('forums')
@UseGuards(JwtAuthGuard) // Apply JWT guard to all routes
export class ForumController {
    constructor(private readonly forumService: ForumService) { }

    @Post('create')
    async create(@Body() createForumThreadDto: CreateForumThreadDto, @Req() req: any) {
        const userId = req.user.id; // Extract user ID from token
        const forumData = {
            ...createForumThreadDto,
            createdBy: new Types.ObjectId(userId), // Ensure it's a valid ObjectId
        };
        return this.forumService.create(forumData);
    }



    @Get()
    async findAll() {
        return this.forumService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.forumService.findOneWithReplies(id);
    }

    @Delete(':threadId')
    async deleteForumThread(@Param('threadId') threadId: string, @Req() req: any) {
        const userId = req.user.id; // Extract user ID from the token
        await this.forumService.deleteForumThread(threadId, userId);
        return { message: 'Forum thread deleted successfully' };
    }

    @Delete('replies/:replyId')
    async deleteReply(@Param('replyId') replyId: string, @Req() req: any) {
        const userId = req.user.id; // Extract user ID from the token
        await this.forumService.deleteReply(replyId, userId);
        return { message: 'Reply deleted successfully' };
    }


    @Post(':threadId/replies')
    async addReplyToThread(
        @Param('threadId') threadId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.addReplyToThread(threadId, userId, body.message);
    }

    @Post('replies/:replyId')
    async addReplyToReply(
        @Param('replyId') replyId: string,
        @Body() body: { message: string },
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.addReplyToReply(replyId, userId, body.message);
    }

    @Put(':id')
    async updateForum(
        @Param('id') id: string,
        @Body() updateData: Partial<ForumThread>,
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.updateForum(id, userId, updateData);
    }

    @Put('replies/:replyId')
    async updateReply(
        @Param('replyId') replyId: string,
        @Body() updateData: Partial<Reply>,
        @Req() req: any,
    ) {
        const userId = req.user.id; // Extract user ID from token
        return this.forumService.updateReply(replyId, userId, updateData);
    }


    @Get('by-course/:courseId')
    async findAllByCourseId(@Param('courseId') courseId: string) {
        return this.forumService.findAllByCourseId(courseId);
    }

    @Get('threads/by-user')
    async findAllByUserId(@Req() req: any) {
        const userId = req.user.id;
        // console.log(req.user.id) // Extract user ID from the token
        return this.forumService.findAllByUserId(userId);
    }
}
