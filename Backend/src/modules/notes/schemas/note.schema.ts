import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Note {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    creator!: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'Course', required: true})
    course !: Types.ObjectId

    @Prop({type: Types.ObjectId, ref: 'Module', required: false})
    module !: Types.ObjectId
    
    @Prop({ type: String, required: true})
    content!: string;

}

export const NoteSchema = SchemaFactory.createForClass(Note);
