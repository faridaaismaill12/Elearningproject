import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: false, unique: true }) // Optional courseId
  courseId?: string;

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
    type: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        difficultyLevel: {
          type: String,
          enum: ['hard', 'medium', 'easy'], // Use consistent values
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
  
  ratings!: Array<{
    userId: string;
    rating: number;
    review?: string;
  }>;

  // Average rating for the course (calculated from the ratings)
  @Prop({ type: Number, default: 0 })
  averageRating!: number;
  
}

export const CourseSchema = SchemaFactory.createForClass(Course);
