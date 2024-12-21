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
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserModule } from '../user/user.module';
import { CommunicationGateway } from './communication.chatgateway';
import { CommunicationController } from './controllers/communication.controller';
import { CommunicationService } from './services/communication.service';
import { CourseModule } from '../course/course.module';
import { NotificationController } from './controllers/notifications.controller';
import { NotificationGateway } from './notifications.gateway';


@Module({
  imports: [
    UserModule,
    CourseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
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
    CommunicationController,
    ForumController,
    NotificationController, // Ensure this is added
    SavedConversationController, // Ensure this is added
  ],
  providers: [
    NotificationGateway, // Ensure this is included
    CommunicationGateway,
    ForumService,
    NotificationService, // Ensure this is included
    SavedConversationService,
    CommunicationService // Ensure this is included
  ],
  exports: [
    NotificationService, // Export services if needed by other modules
    SavedConversationService, // Export if required elsewhere
  ],
})
export class CommunicationModule {}
