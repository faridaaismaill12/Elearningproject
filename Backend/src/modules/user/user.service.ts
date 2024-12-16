
import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Schema as MongooseSchema } from 'mongoose';
import { User } from './schemas/user.schema';
import { Course } from '../course/schemas/course.schema';
import { calculatePasswordEntropy } from '../security/password.utils';
import { JwtService } from '@nestjs/jwt';
import { v2 as cloudinary } from 'cloudinary';
import { CreateStudentDto } from './dto/create-student.dto';
import { SearchStudentDto } from './dto/search-student.dto';
import { SearchInstructorDto } from './dto/search-instructor.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * Registers a new user.
     */
    async register(createUserDto: CreateUserDto) {
        console.log('Register API invoked with DTO:', createUserDto);

        const { email, passwordHash } = createUserDto;

        try {
            console.log('Checking if a user with the email already exists...');
            const existingUser = await this.userModel.findOne({ email }).exec();
            if (existingUser) {
                throw new BadRequestException('Email is already registered.');
            }

            console.log('Calculating password entropy...');
            const entropy = calculatePasswordEntropy(passwordHash);
            if (entropy < 50) {
                throw new BadRequestException('Password is too weak.');
            }

            console.log('Hashing the password...');
            const hashedPassword = await bcrypt.hash(passwordHash, 10);

            console.log('Creating user object for database...');
            const user = new this.userModel({
                ...createUserDto,
                passwordHash: hashedPassword,
            });

            console.log('Saving user to database...');
            await user.save();
            console.log('User saved successfully with ID:', user._id);

            return { message: 'User registered successfully', userId: user._id };
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }


    async enrollUser(userId: string, courseId: string): Promise<{ message: string }> {
        // Validate MongoDB _id format
        if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId)) {
            throw new BadRequestException('Invalid user or course ID format.');
        }

        // Find the user by MongoDB _id
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User with ID ${userId} not found');
        }

        // Ensure enrolledCourses is initialized as an array
        if (!user.enrolledCourses) {
            user.enrolledCourses = [];
        }

        // Find the course by _id
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course with ID ${courseId} not found');
        }

        // Check if the course title is already in the enrolledCourses array
        if (user.enrolledCourses.some((enrolledCourse) => enrolledCourse.equals(course._id))) {
            throw new BadRequestException('User is already enrolled in course "${course.title}"');
        }

        // Add the course title to the user's enrolledCourses array
        user.enrolledCourses.push(course._id);
        await user.save();

        // add the user to the course's enrolledStudents array
        if (!course.enrolledStudents) {
            course.enrolledStudents = [];
        }
        course.enrolledStudents.push(new Types.ObjectId(user._id as Types.ObjectId));
        await course.save();


        return { message: `User ${userId} successfully enrolled in course "${course.title}"` };
    }




    /**
     * Logs in a user and generates a JWT token.
     */
    async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
        const { email, passwordHash } = loginUserDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const payload = { id: user._id, email: user.email, role:user.role }; // Define payload
        const accessToken = this.jwtService.sign(payload); // Sign the token
        return { accessToken };
    }

    /**
     * Generates a JWT token for a user.
     */
    private generateJwt(user: any): string {
        const payload = { email: user.email, sub: user._id.toString() };
        return this.jwtService.sign(payload);
    }

    /**
     * Validates a JWT token.
     */
    async validateToken(token: string): Promise<any> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    /**
     * Initiates password reset by generating a reset token.
     */
    async forgetPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('No user found with this email');
        }

        const resetToken = this.jwtService.sign(
            { sub: user._id, email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: '15m' },
        );

        console.log(`Password reset link: http://localhost:${process.env.PORT}/users/reset-password?token=${resetToken}`);

        return { message: 'Password reset link sent to your email' };
    }

    /**
     * Resets the user's password.
     */
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            const user = await this.userModel.findById(payload.sub);

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const entropy = calculatePasswordEntropy(newPassword);
            if (entropy < 60) {
                throw new BadRequestException('Weak password. Please use a stronger password.');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.passwordHash = hashedPassword;

            await user.save();

            return { message: 'Password reset successfully' };
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw new BadRequestException('An unknown error occurred');
        }
    }

    /**
     * Updates a user's profile.
     */
    async updateProfile(updateUserDto: UpdateUserDto, userId: string) {

        if (updateUserDto.profilePictureUrl) {
            const uploadResult = await this.uploadToCloudinary(updateUserDto.profilePictureUrl);
            updateUserDto.profilePictureUrl = uploadResult.secure_url;
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return { message: 'Profile updated successfully', user: updatedUser };
    }

    /**
     * Deletes a user's profile.
     */
    async deleteProfile(userId: string) {
        const deletedUser = await this.userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User profile deleted successfully' };
    }

    /**
     * Helper to upload profile picture to Cloudinary.
     */
    private async uploadToCloudinary(base64Image: string): Promise<any> {
        try {
            return await cloudinary.uploader.upload(base64Image, {
                folder: 'profile-pictures',
                resource_type: 'image',
            });
        } catch (error) {
            throw new BadRequestException('Failed to upload image');
        }
    }

    async viewProfile(userId: string): Promise<User> {
        const user = await this.userModel
            .findById(userId)
            .select('-passwordHash') // Exclude the password hash from the result
            .populate({
                path: 'enrolledCourses',
                select: 'title description difficultyLevel',
            });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async assignCourse(instructorId: string, studentId: string, courseId: string) {
        // Validate instructor
        const instructor = await this.userModel.findById(instructorId);
        if (!instructor || instructor.role !== 'instructor') {
            throw new ForbiddenException('Only instructors can assign courses');
        }

        // Validate student
        const student = await this.userModel.findById(studentId);
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Validate course
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Ensure `enrolledCourses` is initialized
        if (!student.enrolledCourses) {
            student.enrolledCourses = [];
        }

        // Safely check if already enrolled using `ObjectId.equals`
        const isAlreadyEnrolled = student.enrolledCourses.some((enrolledCourse) =>
            enrolledCourse.equals(course._id),
        );

        if (isAlreadyEnrolled) {
            throw new BadRequestException('Student is already enrolled in this course');
        }

        // Push the course ObjectId directly without converting to string
        student.enrolledCourses.push(course._id);

        // Save the changes
        await student.save();

        return { message: 'Course assigned successfully', student };
    }

    async createStudentAccount(instructorId: string, createStudentDto: CreateStudentDto) {
        const instructor = await this.userModel.findById(instructorId);
        if (!instructor || instructor.role !== 'instructor') {
            throw new ForbiddenException('You are not authorized to create a student account');
        }

        const { name, email, passwordHash } = createStudentDto;

        const existingStudent = await this.userModel.findOne({ email });
        if (existingStudent) {
            throw new BadRequestException('Student with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(passwordHash, 10);

        const student = new this.userModel({
            name: name,
            email: email,
            passwordHash: hashedPassword,
            role: 'student',
        });

        await student.save();
        return { message: 'Student created successfully', student };
    }

    async deleteUser(adminId: string, userId: string) {
        const admin = await this.userModel.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            throw new ForbiddenException('You are not authorized to delete users');
        }

        // Find the user to delete
        const userToDelete = await this.userModel.findByIdAndDelete(userId);
        if (!userToDelete) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User deleted successfully' };
    }


    async getAllUsers(userId: string): Promise<User[]> {
        const admin = await this.userModel.findById(userId);

        // Check if the user making the request is an admin
        if (!admin || admin.role !== 'admin') {
            throw new ForbiddenException('You are not authorized to access this resource');
        }

        const users = await this.userModel.find().select('-passwordHash');
        if (!users || users.length === 0) {
            throw new NotFoundException('No users found');
        }

        return users;
    }

    async searchStudents(searchStudentDto: SearchStudentDto, instructorId: string) {
        const instructor = await this.userModel.findById(instructorId).exec();

        if (!instructor || instructor.role !== 'instructor') {
            throw new ForbiddenException('Only instructors can search for students');
        }

        const query: Record<string, any> = { role: 'student' };

        if (searchStudentDto.name) {
            query.name = { $regex: searchStudentDto.name, $options: 'i' };
        }

        if (searchStudentDto.email) {
            query.email = searchStudentDto.email;
        }

        if (searchStudentDto.studentLevel) {
            query.studentLevel = searchStudentDto.studentLevel;
        }

        if (searchStudentDto.enrolledCourseId) {
            query.enrolledCourses = searchStudentDto.enrolledCourseId;
        }

        if (searchStudentDto.bio) {
            query.bio = searchStudentDto.bio;
        }

        return this.userModel.find(query).exec();
    }

    async searchInstructors(searchInstructorDto: SearchInstructorDto) {
        const query: Record<string, any> = { role: 'instructor' };

        if (searchInstructorDto.name) {
            query.name = { $regex: searchInstructorDto.name, $options: 'i' };
        }

        if (searchInstructorDto.email) {
            query.email = searchInstructorDto.email;
        }

        if (searchInstructorDto.bio) {
            query.bio = { $regex: searchInstructorDto.bio, $options: 'i' };
        }

        return this.userModel.find(query).exec();
    }

    async getUserRole(userId: string) {
        const user = await this.userModel.findById(userId).select('role').exec();
        return user ? user.role : null;
    }

    //return user name by given user id
    async getUserName(userId: string) {
        const user = await this.userModel.findById(userId).select('name').exec();
        return user ? user.name : 'null';
    }

}
