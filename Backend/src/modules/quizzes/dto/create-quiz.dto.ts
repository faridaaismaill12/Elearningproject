import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested, IsMongoId} from 'class-validator';
import { Type } from 'class-transformer';

import {Schema as MongooseSchema } from 'mongoose';

// DTO for creating a Question
export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    moduleId!:string;

    @IsNotEmpty()
    @IsEnum(['MCQ', 'TorF'])
    questionType!: string;

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
    @IsNotEmpty()
    difficultyLevel!: 'easy' | 'medium' | 'hard';
}

// DTO for creating a Quiz
export class CreateQuizDto {
    @IsString()
    @IsNotEmpty()
    name!:string;

    @IsString()
    @IsNotEmpty()
    moduleId!: string; // Ensure this aligns with Mongoose ObjectId for the module reference

    @IsNumber()
    @IsNotEmpty()
    numberOfQuestions!:number;


    @IsNumber()
    @IsNotEmpty()
    duration!: number;

    @IsMongoId()  // userId should be MongoDB ObjectId
    @IsNotEmpty()
    createdBy!:string;

    @IsNotEmpty()
    @IsEnum(['MCQ', 'TorF','Both'])
    quizType!: string;

}
