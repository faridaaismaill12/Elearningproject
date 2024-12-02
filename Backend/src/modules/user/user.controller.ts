import {
    Controller,
    Post,
    Body,
    Patch,
    Delete,
    Get,
    Param,
    BadRequestException,
    Query,
    UseGuards,
    Req,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
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

    /**
     * Register a new user
     */
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        console.log('Register endpoint invoked.');
        return this.userService.register(createUserDto);
    }

    /**
     * Log in an existing user
     */
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        console.log('Login endpoint invoked.');
        return this.userService.login(loginUserDto);
    }

    /**
     * Initiate password reset process
     */
    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        const email = forgotPasswordDto.email;

        if (!email) {
            throw new BadRequestException('Email is required');
        }

        console.log('Forgot Password endpoint invoked.');
        return await this.userService.forgetPassword(forgotPasswordDto);
    }

    /**
     * Reset password using a token
     */
    @Post('reset-password')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        console.log('Token:', token);
        console.log('New Password DTO:', resetPasswordDto);
    
        if (!token || !resetPasswordDto.newPassword) {
            throw new BadRequestException('Token and new password are required');
        }
    
        return await this.userService.resetPassword(token, resetPasswordDto.newPassword);
    }
    

    /**
     * Update user profile
     */
    @UseGuards(JwtAuthGuard)
    @Patch('update/:id')
    async updateProfile(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req: Request & { user: { sub: string; email: string } },
    ) {
        const userIdFromToken = req.user.sub; // Extract user ID from JWT payload

        if (userIdFromToken !== id) {
            throw new ForbiddenException('You can only update your own profile');
        }

        console.log('Update Profile endpoint invoked.');
        return this.userService.updateProfile(updateUserDto, id);
    }

    /**
     * Delete user profile
     */
    @UseGuards(JwtAuthGuard)
    @Delete('profile/:id')
    async deleteProfile(@Param('id') userId: string, @Req() req: Request & { user: { sub: string } }) {
        const userIdFromToken = req.user.sub;

        if (userIdFromToken !== userId) {
            throw new ForbiddenException('You can only delete your own profile');
        }

        console.log('Delete Profile endpoint invoked.');
        return this.userService.deleteUser(userId);
    }

    /**
     * Get user profile by ID
     */
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfile(@Param('id') id: string, @Req() req: any) {
        const userIdFromToken = req.user.sub;

        if (userIdFromToken !== id) {
            throw new UnauthorizedException('You can only access your own profile');
        }

        console.log('Get Profile endpoint invoked.');
        return this.userService.viewProfile(id);
    }

    /**
     * Assign courses to a student (Instructor only)
     */
    // @UseGuards(JwtAuthGuard)
    // @Post(':id/courses')
    // async assignCourses(
    //     @Param('id') instructorId: string,
    //     @Body() assignCoursesDto: any,
    //     @Req() req: Request & { user: { sub: string } },
    // ) {
    //     const userIdFromToken = req.user.sub;

    //     if (userIdFromToken !== instructorId) {
    //         throw new ForbiddenException('You can only assign courses as the logged-in instructor');
    //     }

    //     console.log('Assign Courses endpoint invoked.');
    //     return this.userService.assignCourses(instructorId, assignCoursesDto);
    // }

    // /**
    //  * Delete a user (Admin only)
    //  */
    // @UseGuards(JwtAuthGuard)
    // @Delete(':id')
    // async deleteUser(@Param('id') id: string, @Req() req: Request & { user: { sub: string } }) {
    //     console.log('Delete User endpoint invoked.');
    //     return this.userService.deleteUser(id);
    // }

    /**
     * Get all users (Admin only)
     */
    // @UseGuards(JwtAuthGuard)
    // @Get()
    // async getAllUsers(@Req() req: Request & { user: { sub: string } }) {
    //     console.log('Get All Users endpoint invoked.');
    //     return this.userService.getAllUsers();
    // }

    
}
