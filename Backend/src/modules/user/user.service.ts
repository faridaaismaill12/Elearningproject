import { Injectable, BadRequestException, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
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
        private readonly jwtService: JwtService
    ) { }

    async register(createUserDto: CreateUserDto) {
        console.log('Register API invoked with DTO:', createUserDto);
    
        const { email, passwordHash } = createUserDto;  // `passwordHash` here is actually the raw password
    
        try {
            // Check if the user already exists
            console.log('Checking if a user with the email already exists...');
            const existingUser = await this.userModel.findOne({ email });
            if (existingUser) {
                console.error('Error: Email already registered:', email);
                throw new BadRequestException('Email already registered');
            }
            console.log('No existing user found for email:', email);
    
            // Check password strength
            console.log('Calculating password entropy...');
            const entropy = calculatePasswordEntropy(passwordHash);  // Use the raw password here
            console.log('Password entropy:', entropy);
            if (entropy < 50) {
                console.error('Error: Password is weak, entropy:', entropy);
                throw new BadRequestException('Password is weak');
            }
    
            // Hash the password
            console.log('Generating salt for password hashing...');
            const salt = await bcrypt.genSalt(10);
            console.log('Salt generated:', salt);
            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(passwordHash, salt);  // Hash the raw password
            console.log('Password hashed successfully.');
    
            // Create and save the user
            console.log('Creating user object for database...');
            const user = new this.userModel({ ...createUserDto, passwordHash: hashedPassword });  // Store the hashed password as `passwordHash`
            console.log('Saving user to database...');
            await user.save();
            console.log('User saved successfully with ID:', user._id);
    
            return { message: 'User registered successfully', userId: user._id };
    
        } catch (error) {
            console.error('An error occurred during user registration:', error);
            throw error;
        }
    }    

    async login(loginUserDto: LoginUserDto) {
        const { email, passwordHash } = loginUserDto;  // `passwordHash` is the raw password entered by the user
    
        console.log('Received email:', email);
        console.log('Received raw password:', passwordHash);
    
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }
    
        // Log the stored hashed password in the database
        console.log('Stored hashed password in DB:', user.passwordHash);
    
        // Validate the entered password against the stored hashed password
        const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
        console.log('Is password valid?', isPasswordValid);  // Log the result of the password comparison
        
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }
    
        const token = this.generateJwt(user);
    
        return {
            message: 'Login successful',
            token
        };
    }       

    /////////HEGAB//////////
    
    generateJwt(user: User): string {
        const payload = { email: user.email, sub: user.userId };
        return this.jwtService.sign(payload); // Use the JwtService to sign the token
    }


    async validateUser(email: string, password: string): Promise<User | null> {
        // Find the user by email
        const user = await this.userModel.findOne({ email });
        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            return user;
        }
        return null;
    }

    async validateToken(token: string): Promise<any> {
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET, // Ensure this matches the secret used to sign tokens
            });

            return payload; // Return payload if token is valid
        } catch (error) {
            throw new BadRequestException('Invalid or expired token');
        }
    }

    async forgetPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('No user found with this email');
        }

        // Generate a reset token (valid for 15 minutes)
        const resetToken = this.jwtService.sign(
            { sub: user.id, email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: '15m' },
        );

        // Send token to the user's email (mocked)
        console.log(`Send this reset link to the user's email: http://localhost:3000/doNotForgetAgain/reset-password?token=${resetToken}`);

        // deploy: fix link

        return { message: 'Password reset link has been sent to your email' };
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        try {
            // Verify the token
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
            const user = await this.userModel.findOne({ where: { id: payload.sub } });

            if (!user) {
                throw new UnauthorizedException('Invalid token');
            }

            // Check password strength (optional but recommended)
            const entropy = calculatePasswordEntropy(newPassword);
            if (entropy < 60) {
                throw new BadRequestException('You want to be hacked? Use a stronger password');
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.passwordHash = hashedPassword;

            // Save the updated user to the database
            await user.save();

            return { message: 'Password reset successfully' };
        } catch (error) {
            throw new BadRequestException((error as Error).message);
        }
    }

    private async uploadToCloudinary(base64Image: string): Promise<any> {
        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(base64Image, {
                folder: 'profile-pictures',
                public_id: `user_${Date.now()}`, // Unique identifier
                resource_type: 'image',
            });
            return result; // Result contains secure_url, public_id, etc.
        } catch (error) {
            throw new BadRequestException('Failed to upload image to Cloudinary');
        }
    }

    async updateProfile(
        updateUserDto: UpdateUserDto,
        userId: string,
        token: string
    ) {
        // Ensure only authenticated users can update their own profiles
        const decodedToken = await this.validateToken(token);
    
        if (decodedToken.sub !== userId) {
            throw new ForbiddenException('You can only update your own profile');
        }
    
        // Handle profile picture upload logic
        if (updateUserDto.profilePictureUrl) {
            const uploadResult = await this.uploadToCloudinary(updateUserDto.profilePictureUrl);
            updateUserDto.profilePictureUrl = uploadResult.secure_url; // Use Cloudinary's secure URL
        }
    
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
    
        return { message: 'Profile updated successfully', user: updatedUser };
    }    

    async deleteProfile(userId: string , token: string) {
        // Ensure only the authenticated user can delete their profile
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

    async viewProfile(userId: string , token: string) {
        // Validate user identity
        const decodedToken = await this.validateToken(token);

        if (decodedToken.sub !== userId) {
            throw new ForbiddenException('You can only view your own profile');
        }
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

    // Helper to get userRole
    private async getUserRole(userId?: string): Promise<string> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new ForbiddenException('User not found');
        }
        return user.role;
    }

    async assignCourses(userId: string, assignCoursesDto: any) {
        const userRole = await this.getUserRole(userId);
        if (userRole !== 'instructor') {
            throw new ForbiddenException('Only instructors can assign courses');
        }

        const student = await this.userModel.findById(assignCoursesDto.studentId).populate({ path: 'enrolledCourses', select: 'title difficultyLevel' });
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // Check if the courses to be assigned exist
        const courses = await this.courseModel.find({ _id: { $in: assignCoursesDto.courseIds } });
        if (courses.length !== assignCoursesDto.courseIds.length) {
            throw new NotFoundException('Some courses were not found');
        }

        if (!student.enrolledCourses) {
            student.enrolledCourses = [];
        }

        // Adding the course IDs to the student's enrolledCourses array
        student.enrolledCourses = [...student.enrolledCourses, ...assignCoursesDto.courseIds];

        await student.save();

        return { message: 'Courses assigned successfully' };
    }

    async createAccount(createUserDto: CreateUserDto) {
        const userRole = await this.getUserRole(createUserDto.userId)
        if (userRole !== 'instructor') {
            throw new ForbiddenException('Only instructors can create student accounts');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, salt);
        const user = new this.userModel({ ...createUserDto, passwordHash: hashedPassword });
        await user.save();

        return { message: 'Student account created successfully', userId: user._id };

    }

    async deleteUser(userId: string , token: string) {
        // Validate the JWT token and extract the user's role
        const decodedToken = await this.validateToken(token);
        const userRole = await this.getUserRole(decodedToken.sub);

        if (userRole !== 'admin') {
            throw new ForbiddenException('Only admins can delete users');
        }

        const deletedUser = await this.userModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User deleted successfully' };
    }

    async getAllUsers(token: string) {
         // Validate the JWT token and extract the user's role
        const decodedToken = await this.validateToken(token); 
        const userRole = await this.getUserRole(decodedToken.sub);
        
        if (userRole !== 'admin') {
            throw new ForbiddenException('Only admins can view all users');
        }

        const users = await this.userModel.find().select('-passwordHash').populate({ path: 'enrolledCourses', select: 'title difficultyLevel' });

        if (!users) {
            throw new NotFoundException('User not found');
        }

        return users;
    }

    async getUserById(userId: string) {
        const userRole = await this.getUserRole();
        if (userRole !== 'admin') {
            throw new ForbiddenException('Only admins can view all users by a certain id');
        }

        const user = await this.userModel.findById(userId).select('-passwordHash').populate({ path: 'enrolledCourses', select: 'title difficultyLevel' });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

}