import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose"; // Import Schema from mongoose
import {Course} from '../../course/schemas/course.schema'
import {User} from '../../user/schemas/user.schema'
export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  order!: number;
  
  @Prop({ type: [{ type: String }] })
  resources!: string[]; // List of resource URLs or identifiers specific to the lesson

  @Prop({ type: [{ type: String }] })
  objectives!: string[]; // Learning goals or objectives for the lesson

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Course", required: true })
  course!: MongooseSchema.Types.ObjectId; 

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  instructor!: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  createdBy!: string; // Instructor who created the lesson

  @Prop({ type: String, enum: ["Draft", "Published"], default: "Draft" })
  status!: string;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
