import { IsString , IsEmail , IsEnum , IsOptional , IsBoolean , IsDate , IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  passwordHash?: string;

  @IsOptional()
  @IsEnum(['student' , 'admin' , 'instructor'])
  role?: string;

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
  enrolledCourses?: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  preferences?: Record<string , any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastLogin?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastChangedPassword?: Date;

}
