import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: ['student', 'admin', 'instructor'],
  })
  role!: string;

  @Prop({ default: '' })
  profilePictureUrl?: string;

  @Prop({ required: false })
  birthday?: Date;

  @Prop({
    type: [{ type: String }], // Store an array of MongoDB _id strings
    default: [],
  })
  enrolledCourses?: string[];

  @Prop({ default: '', trim: true })
  bio?: string;

  @Prop({ type: Object, default: {}, required: false })
  preferences?: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean = true;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ default: null })
  lastChangedPassword?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;