import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty, PartialType} from '@nestjs/swagger';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

}
//the RegisterDto would inherit the email and password properties from LoginDto, but they would be optional (because of Partial), and RegisterDto would also have additional fields like username and confirmPassword.
//gives an error 