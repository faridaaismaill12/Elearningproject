import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types,Document, Schema as MongooseSchema } from 'mongoose';

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    question!: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    options!: string[];

    @IsString()
    @IsNotEmpty()
    correctAnswer!: string;

    @IsEnum(['easy', 'medium', 'hard'])
    difficultyLevel!: 'easy' | 'medium' | 'hard';

    @IsString()
    @IsOptional() 
    questionId?: string;
}

export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    moduleId!: string; // Ensure this aligns with Mongoose ObjectId

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions!: CreateQuestionDto[];

    @IsNumber()
    @IsNotEmpty()
    duration!: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startTime!: Date | null;
}
