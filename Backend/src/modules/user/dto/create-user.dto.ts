import { IsString , IsEmail , IsEnum , IsOptional , IsBoolean , IsDate , IsArray , IsNotEmpty , Length } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @Length(3 , 50)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8 , 20)
  passwordHash!: string;

  @IsEnum(['student' , 'admin' , 'instructor'])
  @IsNotEmpty()
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