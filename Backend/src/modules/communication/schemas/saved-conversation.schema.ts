import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Document } from 'mongoose';

export type SavedConversationDocument = SavedConversation & Document;

@Schema({ timestamps: true })
export class SavedConversation {
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user!: Types.ObjectId; // Reference to the user

    @Prop({
        type: [
            {
                sender: { type: Types.ObjectId, ref: 'User' }, // Sender reference
                message: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        default: [],
    })
    messages?: Array<{
        sender: Types.ObjectId;
        message: string;
        timestamp: Date;
    }>; // List of messages

    @Prop({ type: Boolean, default: true })
    isActive?: boolean; // Status of the conversation
}

export const SavedConversationSchema = SchemaFactory.createForClass(SavedConversation);
