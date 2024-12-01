

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true })
  courseId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: "User", required: true })
  instructor!: MongooseSchema.Types.ObjectId; //does the same thing as createdBy

  @Prop({ default: 1 })
  version!: number;

  @Prop({
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  })
  difficultyLevel!: string;

  @Prop({
    type: [
      {
        moduleId: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        lessons: [
          {
            lessonId: { type: String, required: true },
            title: { type: String, required: true },
            content: { type: String, required: true },
          },
        ],
      },
    ],
    default: [],
  })
  modules!: Array<{
    moduleId: string;
    title: string;
    content: string;
    lessons: Array<{
      lessonId: string;
      title: string;
      content: string;
    }>;
  }>;
}

export const CourseSchema = SchemaFactory.createForClass(Course);