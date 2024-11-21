
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Module, ModuleSchema } from "./module.schema";  // Import Module schema


export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {

  @Prop({ required: true, unique: true })
  courseId !: string;  // Unique identifier for the course

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: String, required: true })
  category!: string;  // Course category (e.g., Math, CS)

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  instructor!: Types.ObjectId;

  @Prop({ type: [{ type:[ModuleSchema] }] })
  modules!: [Module];

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  students!: Types.ObjectId[];

  @Prop({ default: 1 })
  version?: number;

  @Prop({ type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true })
  difficultyLevel!: string; // Difficulty level (Beginner, Intermediate, Advanced)

  @Prop({ type: String, required: true })
  createdBy!: string;  // Instructor who created the course
  
  
}

export const CourseSchema = SchemaFactory.createForClass(Course);
