import {IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, ValidateNested,} from 'class-validator';
import { Type } from 'class-transformer';
import {Types} from 'mongoose'
class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class SubmitResponseDto {
  @IsString()
  @IsNotEmpty()
  responseId!: string;

  @IsMongoId()
  @IsNotEmpty()
  userId!: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  quizId!: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];

  @IsNumber()
  @IsNotEmpty()
  score!: number;
}
