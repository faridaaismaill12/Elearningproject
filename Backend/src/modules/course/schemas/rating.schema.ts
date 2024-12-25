import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Rating extends Document {
@Prop({ required: true })
  courseId!: string;  // The ID of the course being rated

@Prop({ required: true })
  userId!: string;    // The ID of the user giving the rating

@Prop({ required: true, min: 1, max: 5 })
  rating!: number;    // Rating value, typically from 1 to 5

// @Prop()
//   review?: string;   // Optional review or feedback from the user
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
export type RatingDocument = Rating & Document;
