import { IsNotEmpty, IsString, IsOptional, IsDate, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNoteDto {
  @IsMongoId()
  @IsNotEmpty()
  creator!: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  course!: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  module?: Types.ObjectId; // Fixed casing

  @IsMongoId()
  @IsOptional() // Made optional to align with schema
  lesson?: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
