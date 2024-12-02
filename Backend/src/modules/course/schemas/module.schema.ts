import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
  @Prop({ required: true })
  courseId!: string; // MongoDB _id of the parent course

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Array, default: [] })
  lessons!: Array<{
    _id?: string; // MongoDB _id for each lesson
    title: string;
    content: string;
  }>;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);