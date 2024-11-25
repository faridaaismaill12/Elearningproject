import { IsArray , IsMongoId , ValidateNested , IsString , IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsMongoId()
  @IsNotEmpty()
  sender!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class CreateChatDto {
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  participants!: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];
}