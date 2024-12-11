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
    participants!: Types.ObjectId[]; // Array of participant IDs

    @Prop({
        type: [{ sender: { type: MongooseSchema.Types.ObjectId, ref: 'User' }, content: String, timestamp: Date }],
    })
    messages?: { sender: Types.ObjectId; content: string; timestamp: Date }[];

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Course',
        required: true,
    })
    courseId!: Types.ObjectId; // Reference to the course
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
