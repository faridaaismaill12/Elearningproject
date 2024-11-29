import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './schemas/course.schema';

@Controller('courses') // Base path for this controller
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Create a new course
  @Post() // This maps POST requests to /courses
  async createCourse(@Body() courseData: Partial<Course>): Promise<Course> {
    return await this.courseService.createCourse(courseData);
  }

  // Get all courses
  @Get()
  async getAllCourses(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  
}
