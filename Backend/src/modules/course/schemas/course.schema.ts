import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

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


  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Chat' }],
    default: [],
  })
  chats?: Types.ObjectId[];

  // add enrolledStudents field

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  enrolledStudents?: Types.ObjectId[];
  

}

export const CourseSchema = SchemaFactory.createForClass(Course);
