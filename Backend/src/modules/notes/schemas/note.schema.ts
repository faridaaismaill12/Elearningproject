import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type noteDocument = HydratedDocument<Note>;
@Schema({ timestamps: true })
export class Note {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    creator!: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'Course', required: true})
    course !: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: 'Module', required: false})
    module !: Types.ObjectId
    
    @Prop({type: Types.ObjectId, ref: 'Lesson', required: false})
    Lesson !: Types.ObjectId
    
    @Prop({ type: String, required: true})
    content!: string;

}

export const NoteSchema = SchemaFactory.createForClass(Note);
