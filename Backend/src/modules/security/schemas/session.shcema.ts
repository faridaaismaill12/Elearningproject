import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,HydratedDocument,Types } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid'

export type sessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: true })
export class Session extends Document {

    @Prop({ required: true,type: Types.ObjectId, ref: 'User'  })
    userId!: Types.ObjectId

    @Prop({ required: true })
    expiresAt!: Date;
    
    @Prop({ required: true,type: Types.ObjectId })
    sessionId!: String;

    @Prop({required: true})
    ipAddress?:  String;

    @Prop({required: true})
    userAgent?: String;

}

export const SessionSchema = SchemaFactory.createForClass(Session);