import { IsString , IsEmail , IsEnum , IsOptional , IsBoolean , IsDate , IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
    
  @IsString()
  userId!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  passwordHash!: string;

  @IsEnum(['student' , 'admin' , 'instructor'])
  role!: string;

  @IsOptional()
  @IsString()
  profilePictureUrl?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthday?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enrolledCourses?: string[] = [];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  preferences?: Record<string , any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastChangedPassword?: Date;

}
