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
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { Course } from '../course/schemas/course.schema';
import { calculatePasswordEntropy } from '../security/password.utils';
import { JwtService } from '@nestjs/jwt';
import { v2 as cloudinary } from 'cloudinary';

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

    /**
     * Logs in a user and generates a JWT token.
     */
    async login(loginUserDto: LoginUserDto) {
        const { email, passwordHash } = loginUserDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const token = this.generateJwt(user);

        return {
            message: 'Login successful',
            token,
        };
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
    async deleteProfile(userId: string, token: string) {
        const decodedToken = await this.validateToken(token);

        if (decodedToken.sub !== userId) {
            throw new ForbiddenException('You can only delete your own profile');
        }

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

    
    // async assignCourses(instructorId: string, assignCoursesDto: { studentId: string; courseIds: string[] }) {
    //     const instructor = await this.userModel.findById(instructorId);
    //     if (!instructor || instructor.role !== 'instructor') {
    //         throw new ForbiddenException('Only instructors can assign courses');
    //     }
    
    //     const student = await this.userModel.findById(assignCoursesDto.studentId);
    //     if (!student) {
    //         throw new NotFoundException('Student not found');
    //     }
    
    //     student.enrolledCourses = [...new Set([...student.enrolledCourses, ...assignCoursesDto.courseIds])];
    //     await student.save();
    
    //     return { message: 'Courses assigned successfully', student };
    // }

    

    async deleteUser(userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findByIdAndDelete(userId);
    
        if (!user) {
            throw new NotFoundException('User not found');
        }
    
        return { message: 'User deleted successfully' };
    }

    

    async getAllUsers(): Promise<User[]> {
        const users = await this.userModel.find().select('-passwordHash'); // Exclude password hashes
        if (!users || users.length === 0) {
            throw new NotFoundException('No users found');
        }
    
        return users;
    }
    
}
