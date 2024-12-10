import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';

@Controller('forums')
export class ForumController {
    constructor(private readonly forumService: ForumService) {}

    // Create a new forum thread
    @Post('create')
    async create(@Body() createForumThreadDto: CreateForumThreadDto) {
        return this.forumService.create(createForumThreadDto);
    }

    // Get all forum threads
    @Get()
    async findAll() {
        return this.forumService.findAll();
    }

    // Get a specific forum thread by ID
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.forumService.findOneWithReplies(id);
    }

    // Delete a forum thread by ID
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.forumService.delete(id);
    }

    // Add a reply to a forum thread (Top-Level Reply)
    @Post(':threadId/replies')
    async addReplyToThread(
        @Param('threadId') threadId: string,
        @Body() body: { userId: string; message: string },
    ) {
        return this.forumService.addReplyToThread(threadId, body.userId, body.message);
    }

    // Add a reply to another reply (Nested Reply)
    @Post('replies/:replyId')
    async addReplyToReply(
        @Param('replyId') replyId: string,
        @Body() body: { userId: string; message: string },
    ) {
        return this.forumService.addReplyToReply(replyId, body.userId, body.message);
    }

    // Get all top-level replies for a thread
    @Get(':threadId/replies')
    async getTopLevelReplies(@Param('threadId') threadId: string) {
        return this.forumService.getTopLevelReplies(threadId);
    }

    // Get nested replies for a specific reply
    @Get('replies/:replyId/nested')
    async getNestedReplies(@Param('replyId') replyId: string) {
        return this.forumService.getNestedReplies(replyId);
    }

    // Get a single reply with its parent and forum information
    @Get('replies/:replyId')
    async getReply(@Param('replyId') replyId: string) {
        return this.forumService.getReply(replyId);
    }
}
