import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'; 
export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
    @Prop({ type:Types.ObjectId, required: true})
    _id!:Types.ObjectId;

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