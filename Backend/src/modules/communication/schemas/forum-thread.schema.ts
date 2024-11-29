import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument,Types } from 'mongoose';

export type forumDocument = HydratedDocument<ForumThread>;
@Schema({ timestamps: true })
export class ForumThread extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    course!: Types.ObjectId; // The course this thread is associated with

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId; // The user who created the thread

    @Prop({ type: String, required: true })
    title!: string; // The title of the thread

    @Prop({ type: String })
    content!: string; // The content of the thread

    @Prop([
        {
            user: { type: Types.ObjectId, ref: 'User', required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        },
    ])
    replies?: Array<{
        user: Types.ObjectId; // The user who replied
        message: string; // The reply message
        timestamp: Date; // Timestamp of the reply
    }>;
}

export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);

// Add schema-level hooks or methods if needed
ForumThreadSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id; // Optionally map _id to id for clarity in JSON responses
    delete obj.__v; // Remove Mongoose version key
    return obj;
};
