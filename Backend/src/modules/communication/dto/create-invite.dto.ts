import { IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateInviteDto {
  from!: Types.ObjectId; // ObjectId of the sender

  to!: Types.ObjectId; // ObjectId of the receiver

  chatRoomId?: Types.ObjectId; // Optional ObjectId of the chat room

    @IsEnum(['pending', 'accepted', 'rejected'])
  status!: 'pending' | 'accepted' | 'rejected'; // Invite status
}
