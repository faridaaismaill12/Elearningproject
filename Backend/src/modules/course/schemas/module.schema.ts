
// module.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from '../../quizzes/schemas/question.schema';
import { Quiz } from '../../quizzes/schemas/quiz.schema';

export type ModuleDocument = Module & Document;



@Schema({ timestamps: true })
export class Module {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  courseId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  })
  difficultyLevel!: 'easy' | 'medium' | 'hard';

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    default: [],
  })
  lessons!: Array<{
    title: string;
    content: string;
  }>;

  @Prop({ unique: true, default: () => new Types.ObjectId().toString() })
  moduleId?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Question' })
  questions!: Types.Array<Question & Document>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quiz' }] })
  quizzes?: Types.ObjectId[];

  @Prop({ type: [String], default: [] }) // Array of strings for file locations
  locations!: string[];
}

export const ModuleSchema = SchemaFactory.createForClass(Module);