import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Mongoose, Types } from 'mongoose';  // Import MongooseSchema for ObjectId
import { Module } from '../../course/schemas/module.schema';
import { Question } from './question.schema';  // Import the Question schema

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {

    @Prop({ type:String, required: true})
    name!:string;

    @Prop({ type:Number, default:10})
    numberOfQuestions!:number;


    @Prop({type:String, enum:['MCQ', 'TorF','Both']})
    quizType!: string;


    @Prop({ required: true, type: Types.ObjectId, ref: 'Module' })
    moduleId!: Types.ObjectId;

    // Update to reference the Question schema

    //@Prop({ type: [Types.ObjectId], ref: 'Question' })
    //questions!:Types.Array<Question & Document>;


    @Prop({ required: true, default: 30 }) // Duration in minutes
    duration!: number;



    @Prop({ type: Types.ObjectId, ref:"User"}) 
    attemptedUsers!:[{
        user:Types.ObjectId;

    }]



    @Prop({ type: Types.ObjectId, ref:"User"})
    createdBy!:Types.ObjectId;
}


export const QuizSchema = SchemaFactory.createForClass(Quiz);

