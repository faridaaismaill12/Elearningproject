import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, enum: ['private', 'group'] })
  type!: 'private' | 'group'; // Ensure type is restricted to 'private' or 'group'

  @Prop({ required: true })
  title!: string; // The chat title

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants!: Types.ObjectId[]; // Array of ObjectIds referencing the User model

  @Prop({
    type: [
      {
        sender: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  })
  messages?: {
    sender: Types.ObjectId; // Reference to the sender in the User model
    content: string; // Message content
    timestamp: Date; // Message timestamp
  }[]; // Array of messages

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Course',
    required: true,
  })
  courseId!: Types.ObjectId; // Reference to the associated Course model
}

export type ChatDocument = Chat & Document; // Ensure `Document` type is merged for Mongoose
export const ChatSchema = SchemaFactory.createForClass(Chat);
