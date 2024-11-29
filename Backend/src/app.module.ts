import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { CommunicationModule } from './modules/communication/communication.module';
import { CourseModule } from './modules/course/course.module'; // Import CourseModule

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Loads .env file globally
        }),
        DatabaseConfig,
        CommunicationModule,
        CourseModule, // Add CourseModule here
        // other modules...
    ],
})
export class AppModule {}
