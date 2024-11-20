import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // adds createdAt and updatedAt attributes automatically without manually creating them 

export class User extends Document {
  @Prop({ required: true , unique: true })
  userId!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true ,
    unique: true ,
    lowercase: true ,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ ,
  })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: ['student' , 'admin' , 'instructor'] , // to be confirmed if we will use an enum for deciding the user type
  })
  role!: string;

  @Prop({ default: null })
  profilePictureUrl?: string;

  @Prop({ required: false })
  birthday?: Date;

  @Prop({
    type: [{ type: Types.ObjectId , ref: 'Course' }] , // references to courses
    default: [],
  })
  enrolledCourses?: Types.ObjectId[];

  @Prop({ default: '' , trim: true })
  bio?: string;

  @Prop({ type: Object , default: {} }) // any object type
  preferences?: Record<string , any>;

  @Prop({ default: true })
  isActive: boolean = true;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ default: null })
  lastChangedPassword?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);