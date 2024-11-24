import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthLogDto {
    @IsNotEmpty()
    @IsString()
    userId!: string; // User ID associated with the auth action

    @IsNotEmpty()
    @IsString()
    action: "LOGIN" | "LOGOUT" | "PASSWORD_RESET" | undefined; // Type of authentication action

    @IsNotEmpty()
    @IsBoolean()
    success!: boolean; // Whether the action was successful

    @IsNotEmpty()
    @IsString()
    ipAddress?: string; // Optional IP address of the user

    @IsNotEmpty()
    @IsString()
    userAgent?: string; // Optional client information (browser or device)
}
