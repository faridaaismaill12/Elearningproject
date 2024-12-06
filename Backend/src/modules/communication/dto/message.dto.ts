import { IsMongoId, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  sender!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content!: string;
}