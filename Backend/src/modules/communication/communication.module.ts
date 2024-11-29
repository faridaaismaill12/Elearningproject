import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/chat-schema';
import { ChatGateway } from './chat-gateway';


// Controllers
import { ForumController } from './controllers/forum.controller';
// import { ThreadController } from './controllers/thread.controller';
// import { NotificationController } from './controllers/notification.controller';
// import { SavedConversationController } from './controllers/saved-conversation.controller';

// Services
import { ForumService } from './services/forum.service';
// import { ThreadService } from './services/thread.service';
// import { NotificationService } from './services/notification.service';
// import { SavedConversationService } from './services/saved-conversation.service';

// Schemas
import { ForumThread, ForumThreadSchema } from './schemas/forum-thread.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { SavedConversation, SavedConversationSchema } from './schemas/saved-conversation.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumThread.name, schema: ForumThreadSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: SavedConversation.name, schema: SavedConversationSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  controllers: [
    ForumController,
    // ThreadController,
    // NotificationController,
    // SavedConversationController,
  ],
  providers: [
    ForumService,
    ChatGateway
    // ThreadService,
    // NotificationService,
    // SavedConversationService,
  ],
})
export class CommunicationModule {}
