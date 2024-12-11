import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(), // Load environment variables
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { expiresIn: '1h', algorithm: 'HS256' },
            }),
        }),
    ],
    providers: [JwtAuthGuard],
    exports: [JwtAuthGuard, JwtModule],
})
export class SecurityModule {}
