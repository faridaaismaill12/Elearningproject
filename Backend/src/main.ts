import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    //app.setGlobalPrefix('api');
    const PORT = configService.get<number>('PORT') || 3000;

    await app.listen(PORT);
    console.log(`Application is running on: http://localhost:${PORT}`);
}
bootstrap();
