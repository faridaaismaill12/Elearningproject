import { IsString, IsArray, IsOptional, IsEnum, IsMongoId, IsNumber, IsDate, IsDefined, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types} from 'mongoose';
import { QuestionType } from '../schemas/questionType.enum';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  name!:string;

  @IsMongoId()
  @IsOptional()  // moduleId is optional for update
  moduleId?: Types.ObjectId;
  
  @IsNumber()
  @IsOptional()
  numberOfQuestions!:number;

  @IsOptional()
  @IsEnum(['MCQ', 'TorF','Both'])
  quizType!: string;


  @IsNumber()
  @IsOptional()  // Duration is optional for update
  duration?: number;
}

export class UpdateQuestionDto{
  @IsEnum(['MCQ', 'TorF'])
  @IsOptional()
  questionType!: string;
  
  @IsOptional()
  @IsString()
  question?: string;  // question can be updated

  @IsOptional()
  @IsString({each:true})
  @IsArray()
  options?: string[];  // options can be updated

  @IsOptional()
  @IsString()
  correctAnswer?: string;  // correctAnswer can be updated

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficultyLevel?: 'easy' | 'medium' | 'hard';  // difficulty can be updated

}