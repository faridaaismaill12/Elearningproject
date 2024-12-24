import { IsEmail, IsNotEmpty } from 'class-validator';

export class EnrollUserDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  courseId!: string;
}