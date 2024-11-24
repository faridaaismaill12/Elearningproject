import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';
import {Schema as MongooseSchema} from 'mongoose'

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  courseId!: string; 

  @IsString()
  @IsNotEmpty()
  title!: string;  

  @IsString()
  @IsNotEmpty()
  description!: string;  

  @IsMongoId()
  @IsNotEmpty()
  instructor!: string;  

  @IsNotEmpty()
  @IsNumber()
  version!: number;

  @IsEnum(['beginner', 'intermediate', 'advanced'])
  @IsNotEmpty()
  difficultyLevel!: string; 
}

