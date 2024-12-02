// create-student.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateStudentDto {
    
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  passwordHash!: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrolledCourses?: string[] = [];

}