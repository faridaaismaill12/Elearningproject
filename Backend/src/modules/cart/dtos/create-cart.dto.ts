import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateCartDto {
    @IsNotEmpty()
    @IsString()
    userId!: string; // ID of the user associated with the cart

    @IsArray()
    @IsNotEmpty()
    courseIds!: string[]; // Array of course IDs in the cart
}

