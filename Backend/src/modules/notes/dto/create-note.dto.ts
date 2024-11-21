import { IsNotEmpty, IsString, IsOptional, IsDate, IsMongoId } from 'class-validator';

export class CreateNoteDto {
  @IsMongoId()
  @IsNotEmpty()
  creator !: string;

  @IsMongoId()
  @IsNotEmpty()
  course !: string;

  @IsMongoId()
  @IsOptional()
  module?: string;

  @IsString()
  @IsNotEmpty()
  content !: string;

  @IsDate()
  @IsNotEmpty()
  lastModified !: Date;
}
