import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  instructor!: string;

  @Prop({
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  })
  difficultyLevel!: string;

  @Prop({
    type: [String],
    default: [],
  })
  keywords!: string[];

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        difficultyLevel: {
          type: String,
          enum: ['hard', 'medium', 'easy'],
          required: true,
          default: 'medium',
        },
        lessons: [
          {
            title: { type: String, required: true },
            content: { type: String, required: true },
          },
        ],
      },
    ],
    default: [],
  })
  modules!: Array<{
    _id?: string;
    title: string;
    content: string;
    difficultyLevel: 'hard' | 'medium' | 'easy';
    lessons: Array<{
      _id?: string;
      title: string;
      content: string;
    }>;
  }>;
}

export const CourseSchema = SchemaFactory.createForClass(Course);