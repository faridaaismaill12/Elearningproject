import { IsEmail , IsString } from 'class-validator';

export class UpdateRole {
    @IsEmail()
    email!: string;

    @IsString()
    role!: string;
}