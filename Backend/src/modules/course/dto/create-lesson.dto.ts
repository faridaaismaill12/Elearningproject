import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types,Document, Schema as MongooseSchema } from 'mongoose';

export class CreateLessonDto{
    @IsString()
    @IsNotEmpty()
    lessonId!: string; 
  
    @IsString()
    @IsNotEmpty()
    title!: string;  
  
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsMongoId()
    @IsNotEmpty()
    moduleId!: MongooseSchema.Types.ObjectId;
    
    @IsNumber()
    @IsNotEmpty()
    order!: number;
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => String)
    resources?: string[];
    
    @IsArray()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => String)
    objectives!: string[];
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    noteId?:MongooseSchema.Types.ObjectId[];

  }    

  
