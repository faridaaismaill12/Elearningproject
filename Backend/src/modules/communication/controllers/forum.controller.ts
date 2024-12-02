import { Controller, Post, Get, Delete, Body, Param, Put } from '@nestjs/common';
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
        return this.forumService.findOne(id);
    }

    // Delete a forum thread by ID
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.forumService.delete(id);
    }

    // Add a reply to a forum thread
    @Put(':id/replies')
    async addReply(
        @Param('id') threadId: string,
        @Body() replyData: { userId: string; message: string },
    ) {
        const { userId, message } = replyData;
        return this.forumService.addReply(threadId, userId, message);
    }
    
    @Put(':id/replies/nested')
    async addNestedReply(
        @Param('id') threadId: string,
        @Body() body: {
            pathToReply: number[]; // Path to the nested reply (array of indices)
            userId: string; // User ID of the person replying
            message: string; // Reply message
        },
    ) {
        const { pathToReply, userId, message } = body;
        return this.forumService.addNestedReply(threadId, pathToReply, userId, message);
    }

    
}
