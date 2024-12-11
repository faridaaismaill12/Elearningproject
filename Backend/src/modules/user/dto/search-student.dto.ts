import { IsOptional , IsString , IsEnum , IsMongoId , IsEmail } from 'class-validator';

export class SearchStudentDto {

  @IsOptional()
  @IsString()
  name?: string; 

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['beginner' , 'average' , 'advanced'] , { message: 'Invalid student level' })
  studentLevel?: string;

  @IsOptional()
  @IsMongoId()
  enrolledCourseId?: string;

  @IsOptional()
  @IsString()
  bio?: string;

}