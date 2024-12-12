import { IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddMessageDto {
    chatRoomId!: Types.ObjectId;

    sender!: Types.ObjectId;

    @IsString()
    content!: string;
}
