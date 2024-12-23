
import {
    Controller,
    HttpCode,
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
import { CreateStudentDto } from './dto/create-student.dto';
import { SearchInstructorDto } from './dto/search-instructor.dto';
import { SearchStudentDto } from './dto/search-student.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard'; // Import RolesGuard
import { Roles } from '../../decorators/roles.decorator'; // Import Roles decorator
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UpdateRole } from './dto/update-student-level.dto';
import { AssignCourseDto } from './dto/assign-course.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService,
                private readonly jwtService: JwtService,
    )
     { }

    /**
     * Register a new user
     */
    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        console.log('Register endpoint invoked.');
        return this.userService.register(createUserDto);
    } // tested

    /**
     * Log in an existing user
     */
    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        console.log('Login endpoint invoked.');
        return this.userService.login(loginUserDto);
    } // tested

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
    } // tested (deployment link)

    /**
     * Reset password using a token
     */
    @Post('reset')
    async resetPassword(
        @Query('token') token: string,
        @Body() resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        const { newPassword } = resetPasswordDto;

        if (!token || !newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        // Call the service to handle the password reset logic
        return await this.userService.resetPassword(token, newPassword);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'instructor') // Only admins and instructors can enroll users
    @Post(':id/enroll/:courseId')
    @HttpCode(200)
    async enrollUser(
        @Param('id') userId: string,
        @Param('courseId') courseId: string
    ): Promise<any> {
        if (!userId || !courseId) {
            throw new BadRequestException('User ID and Course ID are required.');
        }
        return await this.userService.enrollUser(userId, courseId);
    }



    /**
     * Update user profile
     */
    @UseGuards(JwtAuthGuard)
    @Patch('update-profile')
    async updateProfile(
        @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
        const userIdFromToken = req.user.id; // Extract user ID from JWT payload

        console.log('Update Profile endpoint invoked.');
        return this.userService.updateProfile(updateUserDto, userIdFromToken);
    } // tested

    /**
     * Delete user profile
     */
    @UseGuards(JwtAuthGuard)
    @Delete('delete-profile')
    async deleteProfile(@Req() req: any) {
        const userIdFromToken = req.user.id;

        console.log('Delete Profile endpoint invoked.');
        return this.userService.deleteProfile(userIdFromToken);
    } // tested

    /**
     * Get user profile by ID
     */
    @UseGuards(JwtAuthGuard)
    @Get('view-profile')
    async getProfile(@Req() req: any) {
        const userIdFromToken = req.user.id;

        console.log('Get Profile endpoint invoked.');
        return this.userService.viewProfile(userIdFromToken);
    } // tested


    /**
     * Assign courses to a student (Instructor only)
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('instructor') // Only instructors can assign courses
    @Post('assign-course')
    async assignCourse(@Body() assignCourseDto: AssignCourseDto, @Req() req: any) {
      const instructorId = req.user.id; // Extract instructor ID from token
      return this.userService.assignCourse(instructorId, assignCourseDto);
    }


    // create account for student (instructor only)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('instructor') 
    @Post('create-student')
    async createStudentAccount(
        @Body() createStudentDto: CreateStudentDto
    ) {
        return this.userService.createStudentAccount(createStudentDto);
    }

    @UseGuards(JwtAuthGuard , RolesGuard)
    @Roles('admin')
    @Patch('update-student-level')
    async updateLevel(@Body() updateRole: UpdateRole) {
        return this.userService.updateLevel(updateRole);
    }


    // /**
    //  * Delete a user (Admin only)
    //  */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin') // Only admins can delete users
    @Delete('delete-user')
    async deleteUser(
        @Body('userId') userId: string) {
        return this.userService.deleteUser(userId);
    }
// tested

    /**
     * Get all users (Admin only)
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin') // Only admins can view all users
    @Get('get-all-users')
    async getAllUsers() {
        return this.userService.getAllUsers();
    }


    /**
    * Search for students (Instructor only)
    */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('instructor') // Only instructors can search for students
    @Get('search-students')
    async searchStudents(
        @Query() searchStudentDto: SearchStudentDto,
        @Req() req: any
    ) {
        const instructorId = req.user.sub; // Extract instructor ID from token
        return this.userService.searchStudents(searchStudentDto, instructorId);
    }


    /**
     * Search for instructors
     */
    @Get('search-instructors')
    async searchInstructors(@Query() searchInstructorDto: SearchInstructorDto) {
        console.log('Search Instructors endpoint invoked.');
        return this.userService.searchInstructors(searchInstructorDto);
    } // tested

    @UseGuards(JwtAuthGuard)
    @Get('get-role')
    async getUserRole(@Req() req: any) {
        const userId = req.user.id;
        console.log('Get User Role endpoint invoked.');

        return this.userService.getUserRole(userId);
    }


    /**
     * Get users and courses
     */
    @Get('enrolled-data')
    async getEnrolledUsersAndCourses() {
        return await this.userService.getAllData();
    }

    @Get('export-csv')
    async exportCSV(): Promise<{ message: string }> {
      try {
        const filePath = await this.userService.generateCSV();
        return { message: `Data successfully exported to ${filePath}` };
      } catch (error) {
        return { message: 'Failed to generate CSV' };
      }
    }





    @Post('enable')
    @UseGuards(JwtAuthGuard)
    async enableMfa(@Req() req: any) {
    const user = req.user; // Extracted user from token
    if (!user) {
        throw new UnauthorizedException("Invalid token.");
    }

    return this.userService.enable2FA(user.id); // Your service logic
    }



    @UseGuards(JwtAuthGuard)
    @Post('verify')
    async verify2FA(@Body() body: { otp: string }, @Req() req: any) {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }
    
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid Authorization header format');
        }
    
        // Verify token and extract payload
        const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
        const userId = payload.id;
        // console.log('User ID:', userId);
        // console.log('OTP:', body.otp);
        
        if (!userId) {
            throw new UnauthorizedException('Invalid token');
        }
        // console.log('Verify 2FA endpoint invoked.');
        // Verify OTP
        const isValid = await this.userService.verify2FA(userId, body.otp);
        // console.log(isValid);
        if (!isValid) {
            throw new UnauthorizedException('Invalid OTP');
        }

        
    
        return { message: '2FA successful', success: true };
    }



//     @UseGuards(JwtAuthGuard, RolesGuard)
//     @Roles('instructor')
//     @Get(':id/enrolled-courses')
//     async getUserEnrolledCourses(
//         @Param('id') userId: string,
//         @Req() req: any
//     ): Promise<any> {
//         console.log('JWT User Payload:', req.user); // Debugging
//         const { role } = req.user;
    
//         if (role !== 'instructor') {
//             throw new ForbiddenException('Only instructors can access this endpoint');
//         }
    
//         console.log(`Fetching enrolled courses for student ${userId}`);
//         return this.userService.getUserEnrolledCourses(userId);
//     }


//     @UseGuards(JwtAuthGuard) // JWT authentication only
// @Get('my-enrolled-courses')
// async getMyEnrolledCourses(@Req() req: any): Promise<any> {
//     // Extract the user ID and role from the token payload
//     const { id: userId, role } = req.user;

//     console.log('JWT Payload:', req.user); // Debugging

//     // Check if the logged-in user is a student
//     if (role !== 'student') {
//         throw new ForbiddenException('Only students can access this endpoint');
//     }

//     console.log(`Fetching enrolled courses for student with ID: ${userId}`);
//     return this.userService.getUserEnrolledCourses(userId);
// }

    





    //create find user by id
    @Get('find-user/:id')
    async findUserById(@Param('id') id: string) {
        console.log('Find User by ID endpoint invoked.');
        return this.userService.findUserById(id);
    } // tested

}


