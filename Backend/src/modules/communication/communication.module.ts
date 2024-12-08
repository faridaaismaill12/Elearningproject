import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { ForumController } from './controllers/forum.controller';
import { CourseController } from '../course/course.controller';
// Add other controllers if needed
// import { NotificationController } from './controllers/notification.controller';
// import { SavedConversationController } from './controllers/saved-conversation.controller';

// Services
import { ForumService } from './services/forum.service';
import { NotificationService } from './services/notification.service';
import { ChatsService } from './services/communication.service';
import { CourseService } from '../course/course.service';
// import { SavedConversationService } from './services/saved-conversation.service';

// Schemas
import { ForumThread, ForumThreadSchema } from './schemas/forum-thread.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { Chat, ChatSchema } from './schemas/chat-schema';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ForumThread.name, schema: ForumThreadSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Chat.name, schema: ChatSchema },
    ]),
    CourseModule,
    UserModule
  ],
  controllers: [
    ForumController,
    CourseController

    // NotificationController, // Ensure this is added
    // SavedConversationController, // Ensure this is added
  ],
  providers: [
    ForumService,
    NotificationService, // Ensure this is included
    ChatsService,
    CourseService
    // SavedConversationService, // Ensure this is included
  ],
  exports: [
    NotificationService, // Export services if needed by other modules
    // SavedConversationService, // Export if required elsewhere
  ],
})
export class CommunicationModule {}
