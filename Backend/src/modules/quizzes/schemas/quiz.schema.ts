import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';  // Import MongooseSchema to correctly reference ObjectId
import { Module } from '../../course/schemas/module.schema';
export type QuizDocument = Quiz & Document;

@Schema({ timestamps: { createdAt: 'created_at' } })
export class Quiz {
  @Prop({ required: true, unique: true})
  quizId!: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Module' })
  moduleId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ question: String, options: [String], correctAnswer: String ,  
    difficultyLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' } }] })
  questions!: Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
  }>;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);