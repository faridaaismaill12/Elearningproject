import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';



// Controllers
import { ForumController } from './controllers/forum.controller';

// Add other controllers if needed
// import { NotificationController } from './controllers/notification.controller';
import { SavedConversationController } from './controllers/saved-conversation.controller';

// Services
import { ForumService } from './services/forum.service';
import { NotificationService } from './services/notification.service';
import { SavedConversationService } from './services/saved-conversation.service';

// Schemas
import { ForumThread, ForumThreadSchema, Reply, ReplySchema } from './schemas/forum-thread.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { SavedConversation, SavedConversationSchema } from './schemas/saved-conversation.schema';
import { Chat, ChatSchema } from './schemas/chat-schema';
import { UserSchema } from '../user/schemas/user.schema';
import { repl } from '@nestjs/core';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumThread.name, schema: ForumThreadSchema },
      { name: Notification.name, schema: NotificationSchema },
      {name:Reply.name, schema: ReplySchema},
      { name: Chat.name, schema: ChatSchema },
      { name: 'User', schema: UserSchema },
      { name: SavedConversation.name, schema: SavedConversationSchema },
    ]),
  ],
  controllers: [
    ForumController,
    // NotificationController, // Ensure this is added
    SavedConversationController, // Ensure this is added
  ],
  providers: [
    
    ForumService,
    NotificationService, // Ensure this is included
    SavedConversationService, // Ensure this is included
  ],
  exports: [
    NotificationService, // Export services if needed by other modules
    SavedConversationService, // Export if required elsewhere
  ],
})
export class CommunicationModule {}
