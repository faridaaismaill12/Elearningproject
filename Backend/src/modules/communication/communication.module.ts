import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat-schema';
// import other schemas and services

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }])],
  controllers: [],
  providers: [],
  exports: [], // Add any exports if needed
})
export class CommunicationModule {}
