import { IsOptional, IsString, IsMongoId, IsDate } from 'class-validator';

export class UpdateNoteDto {
  @IsMongoId()
  @IsOptional()
  module?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsDate()
  @IsOptional()
  lastModified?: Date;
}
