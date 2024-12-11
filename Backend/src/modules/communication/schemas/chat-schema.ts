import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true })
  type!: 'private' | 'group';

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants!: Types.ObjectId[];

  @Prop({
    type: [{ sender: String, content: String, timestamp: Date }],
  })
  messages?: { sender: string; content: string; timestamp: Date }[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  courseId!: Types.ObjectId;
}

export type ChatDocument = Chat & Document; // Ensure `_id` is included
export const ChatSchema = SchemaFactory.createForClass(Chat);
