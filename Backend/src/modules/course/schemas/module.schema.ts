import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Quiz } from '../../quizzes/schemas/quiz.schema';
import { Lesson } from '../../course/schemas/lesson.schema'
//import { Question } from '../../quizzes/schemas/question.schema';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {

  _id!: Types.ObjectId;

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

  @Prop({
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy',
    })
    difficultyLevel!: 'easy' | 'medium' | 'hard';  
    
  @Prop({ type: [Types.ObjectId], ref:() => 'Question' })
  questions!:MongooseSchema.Types.ObjectId[];

  @Prop({ type: [Date] })
  createdAt?: Date;

  @Prop({ type: [Date] })
  updatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isOutdated!: boolean;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

