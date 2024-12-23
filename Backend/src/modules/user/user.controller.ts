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
    Put,
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
import { EnrollUserDto } from './dto/enroll-user.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard'; // Import RolesGuard
import { Roles } from '../../decorators/roles.decorator'; // Import Roles decorator
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { UpdateRole } from './dto/update-student-level.dto';
import { AssignCourseDto } from './dto/assign-course.dto';

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
    @Post('reset-password')
    async resetPassword(@Query('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
        console.log('Token:', token);
        console.log('New Password DTO:', resetPasswordDto);

        if (!token || !resetPasswordDto.newPassword) {
            throw new BadRequestException('Token and new password are required');
        }

        return await this.userService.resetPassword(token, resetPasswordDto.newPassword);
    } // tested



    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('student')
    @Post('enroll-user')
    async enrollUser(@Body() enrollUser: EnrollUserDto,@Req() req: any) {
        const studentId = req.user.id;
        return await this.userService.enrollUser(studentId , enrollUser);
    }


    @UseGuards(JwtAuthGuard , RolesGuard)
    @Roles('admin')
    @Patch('update-student-level')
    async updateLevel(@Body() updateRole: UpdateRole) {
        return this.userService.updateLevel(updateRole);
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
    } // tested 

   

    /**
     * Get user profile by ID
     */
    @UseGuards(JwtAuthGuard)
    @Get('view-profile/:id')
    async getProfile(@Param('id') id: string, @Req() req: any) {
        const userIdFromToken = req.user.sub;

        if (userIdFromToken !== id) {
            throw new UnauthorizedException('You can only access your own profile');
        }

        console.log('Get Profile endpoint invoked.');
        return this.userService.viewProfile(id);
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
    async getAllUsers(@Req() req: any) {
        const adminId = req.user.sub; // Extract admin ID from token
        return this.userService.getAllUsers(adminId);
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
    
        console.log(`Fetching enrolled courses for student ${userId}`);
        return this.userService.getUserEnrolledCourses(userId);
    }


    @UseGuards(JwtAuthGuard) // JWT authentication only
@Get('my-enrolled-courses')
async getMyEnrolledCourses(@Req() req: any): Promise<any> {
    // Extract the user ID and role from the token payload
    const { id: userId, role } = req.user;

    console.log('JWT Payload:', req.user); // Debugging

    // Check if the logged-in user is a student
    if (role !== 'student') {
        throw new ForbiddenException('Only students can access this endpoint');
    }

    console.log(`Fetching enrolled courses for student with ID: ${userId}`);
    return this.userService.getUserEnrolledCourses(userId);
}

//create find user by id
@Get('find-user/:id')
async findUserById(@Param('id') id: string) {
    console.log('Find User by ID endpoint invoked.');
    return this.userService.findUserById(id);
} // tested

    
@Put(':userId/complete-module/:moduleId')
  async completeModule(
    @Param('userId') userId: string,
    @Param('moduleId') moduleId: string,
  ): Promise<any> {
    // Call the service method to mark the module as completed for the user
    const updatedUser = await this.userService.addCompletedModule(userId, moduleId);
    return updatedUser;
  }





    //create find user by id
    @Get('find-user/:id')
    async findUserById(@Param('id') id: string) {
        console.log('Find User by ID endpoint invoked.');
        return this.userService.findUserById(id);
    } // tested
    

}

