import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from "../../user/schemas/user.schema"
import { Quiz } from "../../quizzes/schemas/quiz.schema"
export type ResponseDocument = Response & Document;

@Schema({ timestamps: true })
export class Response {
    @Prop({ required: true, unique: true })
    responseId!: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })  // Correctly reference ObjectId
    userId!: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Quiz' })  // Correctly reference ObjectId
    quizId!: MongooseSchema.Types.ObjectId;

    @Prop({ 
        type: [{ 
            questionId: { type: String, required: true }, answer: { type: String, required: true } }] 
    })
    answers!: Array<{
        questionId: string;  // This corresponds to the question field in Quiz schema
        answer: string;
    }>;

    @Prop({ required: true })
    score!: number;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);