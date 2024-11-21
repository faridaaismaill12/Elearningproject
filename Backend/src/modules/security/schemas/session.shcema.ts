//log id, user id , event, timestamp, status

//authentication log schema

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid'


@Schema({ timestamps: true })
export class Session extends Document {

    @Prop({ required: true })
    user_id!: String

    @Prop({ required: true })
    Expiry_date!: Date;

    @Prop({ required: true, default: Date.now })
    Created_at!: Date;

    @Prop({ required: true })
    Session_id!: String;

    @Prop()
    Ipaddress?:  String;

    @Prop()
    UserAgent?: String;

}

export const SessionSchema = SchemaFactory.createForClass(Session);