import { Controller , Post , Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.userService.register(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDto: LoginUserDto) {
        return this.userService.login(loginUserDto);
    }

    @Post('forgot-password')
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.userService.forgotPassword(forgotPasswordDto);
    }

}