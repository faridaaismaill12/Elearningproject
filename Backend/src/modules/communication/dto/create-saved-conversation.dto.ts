import { IsMongoId , IsOptional , IsDate , IsNotEmpty } from 'class-validator';

export class CreateSavedConversationDto {
  @IsMongoId()
  @IsNotEmpty()
  user!: string;

  @IsOptional()
  @IsMongoId()
  chat?: string;

  @IsOptional()
  @IsMongoId()
  forumThread?: string;

  @IsDate()
  @IsNotEmpty()
  savedAt!: Date;
}