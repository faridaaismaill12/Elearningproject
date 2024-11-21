import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
    participants!: Types.ObjectId[];

    @Prop({
        type: [
          {
            sender: { type: Types.ObjectId, ref: 'User', required: true },
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
          },
        ],
        required: true,
      })
      messages?: {
        sender: Types.ObjectId;
        content: string;
        timestamp: Date;
      }[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);