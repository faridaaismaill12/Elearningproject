import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document,  Schema as MongooseSchema } from "mongoose";

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {

  @Prop({ required: true, unique: true })
  lessonId!: string;  // Unique identifier for the lesson

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "Module", required: true })
  moduleId!: MongooseSchema.Types.ObjectId;  // Reference to the associated module

  @Prop({ required: true })
  order!: number;

  @Prop({ type: [String] })
  resources?: string[]; // URLs or identifiers for lesson-specific resources

  @Prop({ type: [String] })
  objectives!: string[]; // Learning objectives for the lesson

  @Prop({type: MongooseSchema.Types.ObjectId, ref:"Note"})
  noteId?:MongooseSchema.Types.ObjectId[];


  @Prop({
    type: [
      {
        userId: { type: String, ref: "User" },
        completedAt: { type: Date },
        state: { type: String, enum: ['completed', 'in-progress', 'not-started'], default: 'not-started' },
      },
    ],
    default: [],
  })
  completions!: {
    userId: string;
    completedAt: Date;
    state: string; 
  }[];
  
}
export const LessonSchema = SchemaFactory.createForClass(Lesson);