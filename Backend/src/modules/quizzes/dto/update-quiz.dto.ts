import { IsString, IsArray, IsOptional, IsEnum, IsMongoId, IsNumber, IsDate, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateQuizDto {
  @IsMongoId()
  @IsOptional()  // moduleId is optional for update
  moduleId?: string;

  @IsArray()
  @IsOptional()
  questions?: Array<{
    questionId:string;
    question: string;
    options: string[];
    correctAnswer: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
  }>;

  @IsNumber()
  @IsOptional()  // Duration is optional for update
  duration?: number;
}
