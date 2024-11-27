import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    // Register a user
    async register(createUserDto: CreateUserDto) {
        const { email , passwordHash} = createUserDto;

        // Check if email already exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }

        // Hash password (hegab security)
        const salt = await bcrypt.genSalt(); // hegab security 
        const hashedPassword = await bcrypt.hash(passwordHash , salt); // hegab security 

        // Create and save user
        const user = new this.userModel({ ...createUserDto , passwordHash: hashedPassword });
        await user.save();

        return { message: 'User registered successfully' , userId: user._id };
    }

    // Login a user
    async login(loginUserDto: LoginUserDto) {
        const { email , passwordHash } = loginUserDto;

        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate password (hegab security)
        // const isPasswordValid = await bcrypt.compare(passwordHash , user.passwordHash);
        // if (!isPasswordValid) {
        //     throw new BadRequestException('Invalid credentials');
        // }

        // // Generate a JWT token (assuming JWT is used for authentication)
        // const token = this.generateToken(user._id);

        // return { message: 'Login successful', token };
    }

    // Forgot password
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const { email } = forgotPasswordDto;

        // Find user by email
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('Email not registered');
        }

        // Generate reset token (hegab security)
        //const resetToken = this.generateResetToken(user._id);

        // Send email (hegab security)
        //await this.sendResetEmail(email , resetToken);

        //return { message: 'Password reset email sent' };
    }

}