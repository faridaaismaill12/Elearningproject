import { IsMongoId , IsString , IsEnum , IsBoolean , IsOptional , IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  recipient!: string;

  @IsEnum(['MESSAGE' , 'REPLY' , 'ANNOUNCEMENT'])
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsBoolean()
  @IsOptional()
  read?: boolean;
}