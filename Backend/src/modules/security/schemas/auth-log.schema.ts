//log id, user id , event, timestamp, status

//authentication log schema

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mongoose, Types } from 'mongoose';
import { session } from 'passport';


@Schema({ timestamps: true })
export class AuthenticationLog extends Document {

    @Prop({ required: true,type: Types.ObjectId  })
    logId!: String

    @Prop({ required: true,type: Types.ObjectId, ref: 'User' })
    userId!:  Types.ObjectId;

    @Prop({ required: true, enum: ['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'DELETE_ACCOUNT'] })
    Action!: String

    @Prop({ required: true, default: false })
    Success!: Boolean;

    @Prop({ required: true, default: Date.now })
    timeStamp!: Date;

    @Prop({ required: true,type: Types.ObjectId, ref:'session' })
    SessionId!: Types.ObjectId;

}

export const AuthenticationLogSchema = SchemaFactory.createForClass(AuthenticationLog);