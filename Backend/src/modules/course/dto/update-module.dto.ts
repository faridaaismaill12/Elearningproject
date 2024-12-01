import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types,Document, Schema as MongooseSchema } from 'mongoose';

export class UpdateModuleDto{
    @IsOptional()
    @IsMongoId()
    courseId?: MongooseSchema.Types.ObjectId;
    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;
    
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content?: string;
    
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => String)
    resources?: string[];
    
    
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    lessons?: MongooseSchema.Types.ObjectId[];
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    quizzes?: MongooseSchema.Types.ObjectId[];

    @IsEnum(['easy', 'medium', 'hard'])
    @IsOptional()
    difficultyLevel!: 'easy' | 'medium' | 'hard';

    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    questions!: MongooseSchema.Types.ObjectId[];
}