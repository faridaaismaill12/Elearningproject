import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
    recipient!: Types.ObjectId;

    @Prop({ type: String, enum: ['MESSAGE', 'REPLY', 'ANNOUNCEMENT'], required: true })
    type!: string;

    @Prop({ type: String, required: true })
    message!: string;

    @Prop({ type: Boolean, default: false })
    read!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
