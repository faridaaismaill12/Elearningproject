import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'; 
export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
    @Prop({required:true, type:Types.ObjectId, ref:"Module"})
    moduleId!:Types.ObjectId;

    @Prop({type:String, enum:['MCQ', 'TorF']})
    questionType!: string;

    @Prop({ required: true, type: String })
    question!: string;

    @Prop({ required: true, type: [String] })
    options!: string[];

    @Prop({ required: true, type: String })
    correctAnswer!: string;

    @Prop({
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy',
    })
    difficultyLevel!: 'easy' | 'medium' | 'hard';
}

export const QuestionSchema = SchemaFactory.createForClass(Question);



export interface Question extends Document {
  _id: Types.ObjectId;  // Explicitly add _id
  moduleId: Types.ObjectId;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

