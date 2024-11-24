import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types,Document, Schema as MongooseSchema } from 'mongoose';

export class CreateModuleDto{
    @IsString()
    @IsNotEmpty()
    moduleId!:string;

    @IsMongoId()
    @IsNotEmpty()
    courseId!: MongooseSchema.Types.ObjectId;
    
    @IsString()
    @IsNotEmpty()
    title!: string;
    
    @IsString()
    @IsNotEmpty()
    content!: string;
    
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => String)
    resources?: string[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    lessons?: MongooseSchema.Types.ObjectId[];
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    quizzes?: MongooseSchema.Types.ObjectId[];

}