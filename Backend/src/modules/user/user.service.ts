import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Enroll a user in a course
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
    if (user.enrolledCourses.includes(course.title)) {
      throw new BadRequestException('User is already enrolled in course "${course.title}"');
    }
  
    // Add the course title to the user's enrolledCourses array
    user.enrolledCourses.push(course.title);
    await user.save();
  
    return { message: `User ${userId} successfully enrolled in course "${course.title}"` };
  }
  
}