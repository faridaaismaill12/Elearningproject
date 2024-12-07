import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import autopopulate from 'mongoose-autopopulate';
import { Course } from '../../course/schemas/course.schema';

// Define the Chat document type
export type ChatDocument = Chat & Document;
@Schema({
timestamps: true,
versionKey: false,
})
export class Chat {

@Prop({ required: true })
  name!: string;  // Name of the user is required

@Prop({ required: true })
    content!: string;  // Content of the message is required

@Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name, autopopulate: true })
  sender_id!: User;  // Retrieves the user id from the User schema

@Prop({
  required: true,
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Course',  // Reference to the Course model
  autopopulate: true,
})
courseId!: Course;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.plugin(autopopulate);  // Auto-populate userId field with full user data
