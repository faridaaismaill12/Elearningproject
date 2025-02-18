import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe());

    const PORT = process.env.PORT || 5010;
    await app.listen(PORT);
    console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();