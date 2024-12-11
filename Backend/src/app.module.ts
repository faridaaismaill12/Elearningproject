import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { DatabaseConfig } from './config/database.config';
import { CommunicationModule } from './modules/communication/communication.module';

import { CourseModule } from './modules/course/course.module'; 
import { NoteModule } from './modules/notes/notes.module';

import * as dotenv from 'dotenv';
import { SecurityModule } from './modules/security/security.module';
// import { ChatGateway } from './modules/communication/chat-gateway';


dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Ensures the config is globally available
      envFilePath: '.env'
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    
    UserModule,
    SecurityModule,
    CommunicationModule,
    DatabaseConfig,
    NoteModule,
    CommunicationModule,
    CourseModule,
    QuizzesModule,

  ],
  providers: [],


})
export class AppModule {}

