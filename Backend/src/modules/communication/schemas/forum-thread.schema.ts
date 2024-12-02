import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// Define the schema for nested replies
const NestedReplySchema = new MongooseSchema({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    replies: [{ type: MongooseSchema.Types.Mixed }] // Recursive nested replies
});

// Define the main ForumThread schema
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

    @Prop([{ type: NestedReplySchema }]) // Use the NestedReplySchema
    replies?: Array<{
        user: Types.ObjectId;
        message: string;
        timestamp: Date;
        replies?: Array<{
            user: Types.ObjectId;
            message: string;
            timestamp: Date;
            replies?: unknown[]; // Recursive replies
        }>;
    }>;
}

export const ForumThreadSchema = SchemaFactory.createForClass(ForumThread);

// Optional: Add any schema-level methods or hooks
ForumThreadSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id; // Map `_id` to `id`
    delete obj.__v; // Remove the Mongoose version key
    return obj;
};
