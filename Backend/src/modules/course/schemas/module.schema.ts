import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ModuleDocument = HydratedDocument<Module>

@Schema({ timestamps: true })
export class Module {

  @Prop({required:true, unique:true})
  moduleId!:string;

  @Prop({required:true, type: MongooseSchema.Types.ObjectId, ref:"Course"})
  courseId!: MongooseSchema.Types.ObjectId;
  
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ })
  resources?: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }] })
  lessons?: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Quiz' }] })
  quizzes?: MongooseSchema.Types.ObjectId[];
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
