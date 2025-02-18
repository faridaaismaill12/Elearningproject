import { IsNotEmpty, IsString, IsOptional, IsDate, IsMongoId } from 'class-validator';
import {Types} from 'mongoose'

export class CreateNoteDto {
  @IsMongoId()
  @IsNotEmpty()
  creator !: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  course !: Types.ObjectId;

  @IsMongoId()
  @IsOptional()
  module?: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  lesson!: Types.ObjectId

  @IsString()
  @IsNotEmpty()
  content !: string;

  @IsDate()
  @IsNotEmpty()
  lastModified !: Date;
}
