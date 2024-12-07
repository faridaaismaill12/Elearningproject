import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { SavedConversationService } from '../services/saved-conversation.service';

@Controller('saved-conversations')
export class SavedConversationController {
    constructor(private readonly savedConversationService: SavedConversationService) {}

    @Post('save')
    async saveConversation(
        @Body()
        saveConversationDto: {
            userId: string;
            title: string;
            messages: Array<{ sender: string; message: string; timestamp?: Date }>;
        },
    ) {
        const { userId, title, messages } = saveConversationDto;
        return this.savedConversationService.saveConversation(userId, title, messages);
    }

    @Get(':id')
    async getConversationById(@Param('id') id: string) {
        return this.savedConversationService.getConversationById(id);
    }

    @Get('user/:userId')
    async getUserConversations(@Param('userId') userId: string) {
        return this.savedConversationService.getUserConversations(userId);
    }

    @Delete(':id')
    async deleteConversation(@Param('id') id: string) {
        return this.savedConversationService.deleteConversation(id);
    }
}
