import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateCartDto {
  @IsOptional()
  @IsArray()
  courseIds?: string[]; // Updated list of course IDs in the cart

  @IsOptional()
  @IsString()
  userId?: string; // Optionally update the associated user ID
}
