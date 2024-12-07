import { IsString, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
@IsString()
@IsNotEmpty()
  content!: string;  // The content of the chat message

@IsString()
@IsNotEmpty()
  courseId!: string;  // The ID of the course to which the message belongs (not an ObjectId)
}
