import { IsArray, IsMongoId, ValidateNested, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageDto } from './message.dto'

export class CreateChatDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  participants!: string[];

  @ApiPropertyOptional({ type: [MessageDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages?: MessageDto[];

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  courseId!: string;
}