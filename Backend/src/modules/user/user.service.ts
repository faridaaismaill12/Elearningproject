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
import { Model, Types , Schema as MongooseSchema } from 'mongoose';
import { User } from './schemas/user.schema';
import { Course } from '../course/schemas/course.schema';
import { calculatePasswordEntropy } from '../security/password.utils';
import { JwtService } from '@nestjs/jwt';
import { v2 as cloudinary } from 'cloudinary';
import { CreateStudentDto } from './dto/create-student.dto';

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

        const mongo_id = user._id;

        return {
            message: 'Login successful', 
            token,
            mongo_id
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
        // Step 1: Check if the instructor exists and their role is 'instructor'
        const instructor = await this.userModel.findById(instructorId);
        if (!instructor || instructor.role !== 'instructor') {
            throw new ForbiddenException('Only instructors can assign courses');
        }
    
        // Step 2: Check if the student exists
        const student = await this.userModel.findById(studentId);
        if (!student) {
            throw new NotFoundException('Student not found');
        }
    
        // Step 3: Ensure that `enrolledCourses` is initialized (in case it's undefined)
        if (!student.enrolledCourses) {
            student.enrolledCourses = []; // Initialize as an empty array if undefined
        }
    
        // Step 4: Validate and convert courseId to Mongoose ObjectId
        let courseObjectId;
        try {
            courseObjectId = new MongooseSchema.Types.ObjectId(courseId);
        } catch (error) {
            throw new BadRequestException('Invalid course ID');
        }
    
        // Step 5: Check if the course is already in the student's enrolled courses
        if (student.enrolledCourses.includes(courseObjectId)) {
            throw new BadRequestException('Student is already enrolled in this course');
        }
    
        // Step 6: Assign the course to the student (push the courseId as ObjectId)
        student.enrolledCourses.push(courseObjectId);
        await student.save();
    
        return { message: 'Course assigned successfully', student };
    }    

    async createStudentAccount(instructorId: string , createStudentDto: CreateStudentDto) {
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
    
}
