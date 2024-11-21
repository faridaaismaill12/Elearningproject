//log id, user id , event, timestamp, status

//authentication log schema

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ timestamps: true })
export class AuthenticationLog extends Document {

    @Prop({ required: true })
    log_id!: String

    @Prop({ required: true })
    user_id!: String

    @Prop({ required: true, enum: ['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'DELETE_ACCOUNT'] })
    Action!: String

    @Prop({ required: true, default: false })
    Success!: Boolean;

    @Prop({ required: true, default: Date.now })
    timeStamp!: Date;

    @Prop({ required: true })
    Session_id!: String;

}

export const AuthenticationLogSchema = SchemaFactory.createForClass(AuthenticationLog);