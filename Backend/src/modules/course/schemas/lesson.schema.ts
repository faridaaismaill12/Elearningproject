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

  // Track lesson completion for users
  @Prop({
    type: [
      {
        userId: { type: String, ref: "User" },
        completedAt: { type: Date },
      },
    ],
    default: [],
  })
  completions!: {
    userId: String;
    completedAt: Date;
  }[];

  @Prop({ type: [Date] })
  createdAt?: Date;

  @Prop({ type: [Date] })
  updatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isOutdated!: boolean;
  
}


export const LessonSchema = SchemaFactory.createForClass(Lesson);
