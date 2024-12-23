import { IsEmail, IsNotEmpty } from 'class-validator';

export class AssignCourseDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  courseId!: string;
}