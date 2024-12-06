import { IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatDto {
    @IsArray()
    @IsMongoId({ each: true })
    participants!: Types.ObjectId[];
}