// has the logic implementation 
//this code looks weird 
import { Injectable , BadRequestException , NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Course } from '../course/schemas/course.schema';


@Injectable()
export class UserService {

    constructor(
    @InjectModel(User.name) private readonly userModel: Model<User> ,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>
    ){}

    async register(createUserDto: CreateUserDto) {
        const { email , passwordHash } = createUserDto;
    
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }
    
        // Security: Hash the user's password before saving
        // Use bcrypt to hash the password securely
        const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
        const hashedPassword = await bcrypt.hash(passwordHash, salt); // Hash the password with the salt
    
        // Create and save the user to the database
        const user = new this.userModel({ ...createUserDto, passwordHash: hashedPassword });
        await user.save();
    
        return { message: 'User registered successfully', userId: user._id };
    }    

    async login(loginUserDto: LoginUserDto) {
        const { email , passwordHash } = loginUserDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Security: Validate the provided password against the stored hashed password
        const isPasswordValid = await bcrypt.compare(passwordHash , user.passwordHash);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        // Security: Generate a JWT token for authenticated sessions
        // Generate the token with necessary claims (e.g., user ID, expiration)

        return {
            message: 'Login successful',
            // token: 'jwtToken'  // Placeholder for the actual JWT token to be returned
        };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('Email not registered');
        }

        // Security: Generate a secure reset token
        // Use a secure random generator to create a unique token
        // Set expiration time for the token (e.g., 1 hour)

        // Security: Send the reset token to the user's email securely
        // Implement logic to send the reset email with the token (using Nodemailer, SendGrid, etc.)

        return { message: 'Password reset email sent' };
    }

    async updateProfile(userId: string , updateUserDto: UpdateUserDto) {
        // Security: Validate the user's identity (ensure only authenticated users can update their own profiles)
        // This can be done using JWT tokens or other means to verify the user's identity

        const updatedUser = await this.userModel.findByIdAndUpdate(userId , updateUserDto , { new: true });
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return { message: 'Profile updated successfully' , user: updatedUser };
    }

    async deleteProfile(userId: string) {
        // Security: Validate the user's identity (ensure only the authenticated user can delete their profile)
        // This can be done by comparing the user ID from the JWT with the user ID in the request

        const deletedUser = await this.userModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User profile deleted successfully' };
    }

    async viewProfile(userId: string) {
        // Security: Validate the user's identity (ensure only authenticated users can view their own profiles)
        const user = await this.userModel
        .findById(userId)
        .select('-passwordHash')
        .populate({
            path: 'enrolledCourses',
            select: 'title description difficultyLevel instructor',
            populate: {
                path: 'instructor',
                select: 'name email profilePictureUrl'
        }
    });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
   
  // Assign courses to a user (instructor only)
  async assignCourses(userId: string, assignCoursesDto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const courses = await this.courseModel.find({
      _id: { $in: assignCoursesDto.courseIds },
    });

    if (courses.length !== assignCoursesDto.courseIds.length) {
      throw new BadRequestException('One or more courses not found');
    }
    if (!user.enrolledCourses) {
        user.enrolledCourses = [];
    }
    user.enrolledCourses = [...user.enrolledCourses, ...assignCoursesDto.courseIds];
    await user.save();

    return { message: 'Courses assigned successfully', courses: user.enrolledCourses };
  }

  // Create a new student account (instructor only)
  async createAccount(createUserDto: CreateUserDto) {
    const { email } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const user = new this.userModel(createUserDto);
    await user.save();

    return { message: 'Account created successfully', userId: user._id };
  }

  // Delete a user (admin only)
  async deleteUser(userId: string) {
    const user = await this.userModel.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return { message: 'User deleted successfully' };
  }

  // Get all users (admin only)
  async getAllUsers() {
    return this.userModel.find().select('-passwordHash').populate('enrolledCourses', 'title description');
  }

  // Get a user by ID (admin only)
  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash').populate('enrolledCourses', 'title description');
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}

    


