import { ApiProperty } from "@nestjs/swagger";
import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
export class LoginDto {

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}