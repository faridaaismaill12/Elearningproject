import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {

  _id!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  role!: string;

  @Prop({
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  })
  difficultyLevel!: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Module' }] })
  modules!: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [Date] })
  createdAt?: Date;

  @Prop({ type: [Date] })
  updatedAt?: Date;

  @Prop({ type: Boolean, default: false })
  isOutdated!: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);