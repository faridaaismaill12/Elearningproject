import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Schema as MongooseSchema } from "mongoose"; 
import {User} from "../../user/schemas/user.schema"

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true})
  courseId!: string; // Unique identifier for the course

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, required: true })
  instructor!: string; //does the same thing as createdBy

  @Prop({ default: 1 })
  version!: number;

  @Prop({ type: String, enum: ["beginner", "intermediate", "advanced"], required: true })
  difficultyLevel!: string; 

}

export const CourseSchema = SchemaFactory.createForClass(Course);



