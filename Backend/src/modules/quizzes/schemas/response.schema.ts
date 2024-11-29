import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
export type ResponseDocument = HydratedDocument<Response>;

@Schema({ timestamps: true })
export class Response {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })  // Correctly reference ObjectId
    user!: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'Quiz' })  // Correctly reference ObjectId
    quiz!: MongooseSchema.Types.ObjectId;

    @Prop({ 
        type: [{ 
            questionId: { type: String, required: true }, 
            answer: { type: String, required: true } }] 
    })
    answers!: Array<{
        questionId: string;  // This corresponds to the question field in Quiz schema
        answer: string;
    }>;

    @Prop({ required: true })
    score!: number;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);