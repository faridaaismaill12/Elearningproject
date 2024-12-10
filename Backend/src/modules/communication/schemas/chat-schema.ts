import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import autopopulate from 'mongoose-autopopulate';
import { Course } from '../../course/schemas/course.schema';
import { Types, Document } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

// Define the Chat document type
export type ChatDocument = HydratedDocument<Chat>;
@Schema({
timestamps: true,
versionKey: false,
})
export class Chat {

@Prop({ required: true})
participants!: Types.ObjectId[];

@Prop({ required: true })
  name!: string; 

@Prop({ required: true, type: Types.ObjectId, ref: 'Message'})
messages!: Types.ObjectId[];

}
export const ChatSchema = SchemaFactory.createForClass(Chat);

