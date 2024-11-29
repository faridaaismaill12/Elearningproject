import { Controller, Post, Get, Delete, Body, Param, Put } from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumThreadDto } from '../dto/create-forum-thread.dto';

@Controller('forums')
export class ForumController {
    constructor(private readonly forumService: ForumService) { }

    // Create a new forum thread
    @Post('create') // Change to a specific path to avoid conflict
    async create(@Body() createForumThreadDto: CreateForumThreadDto) {
        return this.forumService.create(createForumThreadDto);
    }

    // Get all forum threads
    @Get()
    async findAll() {
        return this.forumService.findAll();
    }

    // Get a specific forum thread by ID
    @Get(':id') // Ensure :id only processes valid IDs
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
}
