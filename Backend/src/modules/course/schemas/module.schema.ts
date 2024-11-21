import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Lesson, LessonSchema } from './lessons.schema' ;  // Import Lesson schema

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {

  @Prop({ required: true, unique: true })
  moduleId!: string;  // Unique identifier for the module

  @Prop({ type: String, required: true })
  courseId!: string;  // Associated course ID (String)

  @Prop({ required: true })
  title !: string;

  @Prop({ required: true })
  description!: string;
  
  @Prop({ required: true })
  order!: number;

  @Prop({ type: [LessonSchema], required: true })
  content!: Lesson[]; // Array of Lesson objects


  
  @Prop({ type: [String], required: false })
  resources?: string[];  // Array of URLs to additional resources (optional)



}

export const ModuleSchema = SchemaFactory.createForClass(Module);
