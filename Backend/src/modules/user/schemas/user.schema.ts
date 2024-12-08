import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
@Prop({ type: Types.ObjectId, required: true, unique: true, default: () => new Types.ObjectId() })
userId!: Types.ObjectId;

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
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }],
    default: [],
})
enrolledCourses?: Types.ObjectId[];

@Prop({
    type: String,
    enum: ['beginner', 'average', 'advanced'],
    required: true,
    default: 'beginner',
})
studentLevel!: string;

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