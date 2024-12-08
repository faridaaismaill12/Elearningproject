
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
//import { Question } from '../../quizzes/schemas/question.schema';


export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
  _id!: Types.ObjectId; // Explicitly type _id

  @Prop({ required: true })
  courseId!: string; // MongoDB _id of the parent course

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({
    type: String,
    enum: ['easy', 'medium', 'hard'], // Ensure consistent enum values
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

  @Prop({ unique: true, default: () => new Types.ObjectId().toString() }) // Auto-generate unique moduleId
  moduleId?: string;

 // questions!:Types.Array<Question & Document>;
}





export const ModuleSchema = SchemaFactory.createForClass(Module);