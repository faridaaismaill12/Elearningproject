import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
// import { CartModule } from './modules/cart/cart.module';
import { CommunicationModule } from './modules/communication/communication.module';
// import { UserModule } from './modules/user/user.module';
import{ CourseModule} from './modules/course/course.module'
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { SecurityModule } from './modules/security/security.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Loads .env file globally
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
          CommunicationModule,
          CourseModule,
    ],
})
export class AppModule { }
