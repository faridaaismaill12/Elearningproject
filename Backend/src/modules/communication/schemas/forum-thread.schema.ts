import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ForumThread extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course!: Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: String, required: true })
    title!: string;

    @Prop({ type: String })
    content!: string;

    @Prop([{ type: Types.ObjectId, ref: 'Reply' }]) // Allow ObjectId[] or populated Reply[]
    replies?: (Types.ObjectId | Reply)[];
}

export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);

@Schema({ timestamps: true })
export class Reply extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ type: String, required: true })
    message!: string;

    @Prop([{ type: Types.ObjectId, ref: 'Reply' }]) // Allow ObjectId[] or populated Reply[]
    replies?: (Types.ObjectId | Reply)[];

    @Prop({ type: Types.ObjectId, ref: 'ForumThread', required: false }) // Link to parent thread
    forumThread?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Reply', required: false }) // Link to parent reply
    parent?: Types.ObjectId | null;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);
