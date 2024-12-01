import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>, // CourseModel is here
  ) {}



  async enrollUser(userId: string, courseId: string): Promise<{ message: string }> {
    // Find the user by userId
    const user = await this.userModel.findOne({ userId });
    if (!user) {
      throw new NotFoundException('User with ID ${userId} not found');
    }
  
    // Ensure enrolledCourses is initialized as an array
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
  
    // Check if the course exists
    const course = await this.courseModel.findOne({ courseId });
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
  
    // Check if the course is already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      throw new BadRequestException('User is already enrolled in course ${courseId}');
    }
  
    // Add the courseId to the user's enrolledCourses array
    user.enrolledCourses.push(courseId);
    await user.save();
  
    return { message: 'User ${userId} successfully enrolled in course ${courseId} '};
  }
  



}