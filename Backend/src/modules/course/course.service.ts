
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Create a course
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  // Get all courses
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }
}
