import { IsArray, IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types,Document, Schema as MongooseSchema } from 'mongoose';

export class UpdateLessonDto{
    @IsString()
    @IsOptional()
    title?: string; 

    @IsString()
    @IsOptional()
    content?: string;

    @IsMongoId()
    @IsOptional()
    moduleId?: MongooseSchema.Types.ObjectId;

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => String)
    resources?: string[];
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => String)
    objectives?: string[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => MongooseSchema.Types.ObjectId)
    noteId?:MongooseSchema.Types.ObjectId[];

}