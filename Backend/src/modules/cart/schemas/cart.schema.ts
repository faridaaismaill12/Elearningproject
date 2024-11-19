import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user!: Types.ObjectId;

    @Prop([{ type: Types.ObjectId, ref: 'Course', required: true }])
    courses!: Types.ObjectId[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
