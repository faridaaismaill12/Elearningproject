import { IsOptional, IsString, IsEnum, IsMongoId,IsNumber } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  version?: number;

  @IsOptional()
  @IsMongoId()
  instructor?: string; // Ensure the ID is a valid MongoDB ObjectId

  @IsOptional()
  @IsEnum(["beginner", "intermediate", "advanced"], {
    message: "difficultyLevel must be one of: beginner, intermediate, advanced",
  })
  difficultyLevel?: string;
}
