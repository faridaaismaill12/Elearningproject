import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
// import { CartModule } from './modules/cart/cart.module';
import { CommunicationModule } from './modules/communication/communication.module';
// import { UserModule } from './modules/user/user.module';
import{ CourseModule} from './modules/course/course.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Loads .env file globally
        }),
        DatabaseConfig,
        // CartModule,
        CommunicationModule,CourseModule
        // UserModule,
        // other modules...
    ],
})
export class AppModule { }
