import { IsArray , IsMongoId , ValidateNested , IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageDto } from './create-chat.dto'

export class UpdateChatDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  participants?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];
}