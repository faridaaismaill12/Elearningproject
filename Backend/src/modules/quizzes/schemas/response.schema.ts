import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types} from 'mongoose';
import { User } from "../../user/schemas/user.schema";  // Import User schema
import { Quiz } from "../../quizzes/schemas/quiz.schema";  // Import Quiz schema
import { Question } from "../../quizzes/schemas/question.schema";  // Import Question schema

export type ResponseDocument = HydratedDocument<QuizResponse>;

@Schema({ timestamps: true })
export class QuizResponse {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })  // Correctly reference ObjectId for User
    user!: Types.ObjectId;

    @Prop({ type:Types.ObjectId, required: true, ref: 'Quiz' })  // Correctly reference ObjectId for Quiz
    quiz!: Types.ObjectId;

    @Prop({ type:Types.ObjectId, required: true, ref: 'Question' }) 
    questionsIds!: Types.ObjectId[];

    @Prop({ 
        type: [{
            questionId: { type: Types.ObjectId, required: true, ref: 'Question' }, // Now references Question _id
            answer: { type: String, required: true } 
        }] 
    })
    answers!: Array<{
        questionId: Types.ObjectId;  // This now references the ObjectId of Question
        answer: string; //the one the student chose 
    }>;

    @Prop({ required: true })
    score!: number;

    // Adding quiz progress tracking
    @Prop({ required: true, default: 0 })
    correctAnswers!: number;

    @Prop({ required: true, default: 0 })
    totalAnswered!: number;

    @Prop({ type: Date, default: null }) 
    startTime!: Date | null;
}

export const ResponseSchema = SchemaFactory.createForClass(QuizResponse);
