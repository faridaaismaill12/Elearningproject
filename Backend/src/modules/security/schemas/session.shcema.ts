//log id, user id , event, timestamp, status

//authentication log schema

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid'


@Schema({ timestamps: true })
export class Session extends Document {

    @Prop({ required: true,type: Types.ObjectId, ref: 'User'  })
    userId!: Types.ObjectId

    @Prop({ required: true })
    ExpiryDate!: Date;

    @Prop({ required: true, default: Date.now })
    CreatedAt!: Date;

    @Prop({ required: true,type: Types.ObjectId })
    SessionId!: String;

    @Prop({required: true})
    Ipaddress?:  String;

    @Prop({required: true})
    UserAgent?: String;

}

export const SessionSchema = SchemaFactory.createForClass(Session);