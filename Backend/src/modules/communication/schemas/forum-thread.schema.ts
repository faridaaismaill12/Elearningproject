import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument,Types } from 'mongoose';

export type forumDocument = HydratedDocument<ForumThread>;
@Schema({ timestamps: true })
export class ForumThread extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: String, required: true })
    title!: string;

    @Prop({ type: String })
    content!: string;

    @Prop([
        {
            user: { type: Types.ObjectId, ref: 'User', required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ])
    replies?: {
        user: Types.ObjectId;
        message: string;
        timestamp: Date;
    }[];
}

export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);