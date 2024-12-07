import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
@Prop({ type: Types.ObjectId, ref: 'User', required: true })
userId!: Types.ObjectId;

@Prop({ required: true })
title!: string;

@Prop({ required: true })
content!: string;

@Prop({ required: true })
type!: string; // 'message' | 'discussion' | 'announcement'

@Prop({ default: false })
isRead!: boolean;

}
export const NotificationSchema = SchemaFactory.createForClass(Notification);