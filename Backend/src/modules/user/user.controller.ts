import { Controller, Post, Body, Patch, Delete, Get, Param, BadRequestException, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UserService } from './user.service';
import { ResetPasswordDto } from './dto/password-reset.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.userService.register(createUserDto);
    }

    @Post('login')
    login(@Body() loginUserDto: LoginUserDto) {
        return this.userService.login(loginUserDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const email = forgotPasswordDto.email;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        return await this.userService.forgetPassword(email);
    }

    @Post('reset')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        const { newPassword } = resetPasswordDto;

        if (!token || !newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        return await this.userService.resetPassword(token, newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update/:id')
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req: Request,
    ) {
        const userIdFromToken = (req.user as any)?.sub; // Extract user ID from JWT payload

        if (userIdFromToken !== id) {
            throw new NotFoundException('You can only update your own profile');
        }

        const updatedUser = await this.userService.updateProfile(id, updateUserDto);
        return { message: 'User updated successfully', user: updatedUser };
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
    assignCourses(@Param('id') id: string, @Body() assignCoursesDto: any) {
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
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

}