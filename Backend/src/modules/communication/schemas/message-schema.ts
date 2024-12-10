import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
@Prop({ required: true })
content!: string;

@Prop({ required: true, type: Types.ObjectId, ref: 'User' })
sender!: Types.ObjectId;

@Prop({ required: true, type: Types.ObjectId, ref: 'Chat' })
chat!: Types.ObjectId;

@Prop({ required: true})
receivers!: Types.ObjectId[];
}
export const MessageSchema = SchemaFactory.createForClass(Message);