import { IsNotEmpty, IsString, IsDate } from 'class-validator';

export class CreateSessionDto {
    @IsNotEmpty()
    @IsString()
    userId!: string; // User ID associated with the session

    @IsNotEmpty()
    @IsString()
    sessionId!: string; // Unique session token

    @IsNotEmpty()
    @IsDate()
    expiresAt!: Date; // Expiry date of the session

    @IsNotEmpty()
    @IsString()
    ipAddress?: string; // Optional IP address of the session

    @IsNotEmpty()
    @IsString()
    userAgent?: string; // Optional client information (browser or device)
}
