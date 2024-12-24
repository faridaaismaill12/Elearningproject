import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { CourseModule } from './modules/course/course.module'; 
import { NoteModule } from './modules/notes/notes.module';
import { SecurityModule } from './modules/security/security.module';

import * as dotenv from 'dotenv';

// Ensure that the environment variables are loaded from the .env file
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Makes the config globally available
      envFilePath: '.env',  // Load the .env file from the root directory
    }),

    // Setup the database connection using the environment variable
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log('server is running on port', process.env.PORT);
        if (!uri) {
          console.error('MONGO_URI is not defined in the .env file');
          throw new Error('MONGO_URI is not defined');
        }
        console.log('MongoDB Connection URI:', uri);  // Optional: Log the URI to ensure it's being read correctly
        return { uri };
      },
      inject: [ConfigService],
    }),

    // Your other modules
    UserModule,
    SecurityModule,
    CommunicationModule,
    NoteModule,
    CourseModule,
    QuizzesModule,
  ],
  providers: [],
})
export class AppModule {}
