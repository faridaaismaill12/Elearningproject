import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Mongoose, Types } from 'mongoose';
//import { session } from 'passport';

export type authenticationlogDocument = HydratedDocument<AuthenticationLog>;
@Schema({ timestamps: true })
export class AuthenticationLog extends Document {

    @Prop({ required: true,type: Types.ObjectId  })
    logId!: String

    @Prop({ required: true,type: Types.ObjectId, ref: 'User' })
    userId!: Types.ObjectId;

    @Prop({ required: true, enum: ['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'DELETE_ACCOUNT'] })
    action!: String

    @Prop({ required: true, default: false })
    success!: Boolean;

    @Prop({ required: true, default: Date.now })
    timeStamp!: Date;

    @Prop({ required: true,type: Types.ObjectId, ref:'session' })
    sessionId!: Types.ObjectId;

}

export const AuthenticationLogSchema = SchemaFactory.createForClass(AuthenticationLog);