import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
// import { CartModule } from './modules/cart/cart.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { ChatSchema } from './modules/communication/schemas/chat-schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './modules/communication/chat-gateway';
// import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Loads .env file globally
        }),
        MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
        DatabaseConfig,
        CommunicationModule,
        
    ],providers: [ChatGateway],
})
export class AppModule { }
