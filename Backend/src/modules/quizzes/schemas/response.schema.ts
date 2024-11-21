import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose'; 
//import {User} from "../models/user.schema"
//import {Quiz} from "../models/quiz.schema"
export type ResponseDocument = Response & Document;

@Schema({ timestamps: { createdAt: 'submitted_at', updatedAt: false } })
export class Response {
  @Prop({ required: true, unique: true })
  responseId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })  // Correctly reference ObjectId
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Quiz' })  // Correctly reference ObjectId
  quizId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ question_id: String, answer: String }] })
  answers!: Array<{
    questionId: string;
    answer: string;
  }>;

  @Prop({ required: true })
  score!: number;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);