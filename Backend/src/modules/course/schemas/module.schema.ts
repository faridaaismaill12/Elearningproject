import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
  @Prop({ required: true, unique: true })
  moduleId!: string;

  @Prop({ required: true })
  courseId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Array, default: [] })
  lessons!: Array<{
    lessonId: string;
    title: string;
    content: string;
  }>;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);