import { IsMongoId , IsOptional , IsDate } from 'class-validator';

export class UpdateSavedConversationDto {
  @IsOptional()
  @IsMongoId()
  chat?: string;

  @IsOptional()
  @IsMongoId()
  forumThread?: string;

  @IsDate()
  savedAt!: Date;
}