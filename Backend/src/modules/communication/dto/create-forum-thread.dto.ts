import { IsString, IsMongoId, IsArray, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ReplyDto {
  @IsMongoId()
  @IsNotEmpty()
  user!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class CreateForumThreadDto {
  @IsMongoId()
  @IsNotEmpty()
  course!: string;

  @IsMongoId()
  @IsNotEmpty()
  createdBy!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplyDto)
  replies?: ReplyDto[];
}