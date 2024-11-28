import { Controller , Post , Body , Patch , Delete , Get , Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

    @Patch('profile')
    updateProfile(@Body() updateUserDto: UpdateUserDto , @Param('id') userId: string) {
        return this.userService.updateProfile(userId, updateUserDto);
    }

    @Delete('profile')
    deleteProfile(@Param('id') userId: string) {
        return this.userService.deleteProfile(userId);
    }

    @Get('profile')
    viewProfile(@Param('id') userId: string) {
        return this.userService.viewProfile(userId);
    }

    // (instructor only)
    @Post(':id/courses')
    assignCourses(@Param('id') id: string , @Body() assignCoursesDto: any) {
        return this.userService.assignCourses(id, assignCoursesDto);
    }

    // (instructor only)
    @Post('student')
    createAccount(@Body() createUserDto: CreateUserDto) {
        return this.userService.createAccount(createUserDto);
    }

    // (admin only)
    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

    // (admin only)
    @Get()
    getAllUsers() {
        return this.userService.getAllUsers();
    }

    // (admin only)
    @Get(':id')
    getUserById(@Param('id') id: string){
        return this.userService.getUserById(id);
    }

}