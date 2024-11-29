import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type savedconverstaionDocument = HydratedDocument<SavedConversation>;
@Schema({ timestamps: true })
export class SavedConversation extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Chat' })
    chat?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ForumThread' })
    forumThread?: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    savedAt!: Date;
}

export const SavedConversationSchema = SchemaFactory.createForClass(SavedConversation);
