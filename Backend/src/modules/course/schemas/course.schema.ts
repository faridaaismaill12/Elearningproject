import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ unique: true })
  courseId!: string;

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


// Use middleware to set courseId to _id after the document is initialized
CourseSchema.pre('save', function (next) {
  if (!this.courseId) {
    this.courseId = this._id.toHexString(); // Set courseId to match _id
  }
  next();
});
