import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from '../../user/schemas/user.schema';
import autopopulate from 'mongoose-autopopulate';
export type ChatDocument = HydratedDocument<Chat>; //changed it to a hydrated document so the chats return populated
// will be mainly using it for chat history

@Schema({
    timestamps: true,
    versionKey: false,
})
export class Chat {

    @Prop({ required: true })
    content!: string; //content of the message is required

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: User.name, autopopulate: true })
    userId!: User; //retrieves the user id from the user schema


}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.plugin(autopopulate); //autopopulates the user id