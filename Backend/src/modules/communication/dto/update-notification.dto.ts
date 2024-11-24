import { IsOptional , IsBoolean } from 'class-validator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}