import {  IsArray,  IsMongoId, IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsDate, ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class AnswerDto {
  @IsMongoId()  // MongoDB ObjectId for questionId
  @IsNotEmpty()
  question!: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

export class SubmitResponseDto {
  @IsMongoId()  
  @IsNotEmpty()
  user!: Types.ObjectId;

  @IsMongoId()  
  @IsNotEmpty()
  quiz!: Types.ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];

  @IsNumber()
  @IsNotEmpty()
  score!: number;

  // New attributes based on schema
  @IsNumber()
  @IsNotEmpty()
  correctAnswers!: number;

  @IsNumber()
  @IsNotEmpty()
  totalAnswered!: number;


  @IsOptional()  
  @IsDate()
  @Type(() => Date)  
  startTime!: Date | null;
}
