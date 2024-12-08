import { IsOptional , IsString , IsEmail , IsBoolean } from 'class-validator';

export class SearchInstructorDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string; 

  @IsOptional()
  @IsString()
  bio?: string;

}