import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
//import { Course } from '../models/course.schema';
import { Quiz } from '../../quizzes/schemas/quiz.schema';
import { Lesson } from '../../course/schemas/lesson.schema'

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {

  @Prop({required:true, unique:true})
  moduleId!:string;

  @Prop({required:true, type: MongooseSchema.Types.ObjectId, ref:"Course"})
  courseId!: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ })
  resources?: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }] })
  lessons?: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' }] })
  quizzes?: MongooseSchema.Types.ObjectId[];
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
