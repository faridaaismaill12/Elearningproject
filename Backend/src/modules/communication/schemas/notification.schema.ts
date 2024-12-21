import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    recipient!: Types.ObjectId; // The user receiving the notification

    @Prop({ type: String, enum: ['MESSAGE', 'REPLY', 'ANNOUNCEMENT'], required: true })
    type!: string; // The type of notification (MESSAGE, REPLY, ANNOUNCEMENT)

    @Prop({ type: String, required: true })
    message!: string; // The content of the notification

    @Prop({ type: Boolean, default: false })
    read!: boolean; // Whether the notification has been read
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
