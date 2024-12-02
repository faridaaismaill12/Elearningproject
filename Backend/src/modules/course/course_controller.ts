import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Create a course with optional courseId
  @Post()
  async createCourse(
    @Body()
    courseData: {
      courseId?: string; // Optional course ID
      title: string;
      description: string;
      instructor: string;
      difficultyLevel: string;
    },
  ) {
    return await this.courseService.createCourse(courseData);
  }

  // Create a module for a specific course using MongoDB _id
  @Post(':id/modules')
  async createModule(
    @Param('id') courseId: string,
    @Body() moduleData: { title: string; content: string },
  ): Promise<any> {
    if (!moduleData.title || !moduleData.content) {
      throw new BadRequestException('title and content are required to create a module.');
    }
  
    return await this.courseService.createModuleForCourse(courseId, moduleData);
  }
  



  // Create a lesson for a specific module using MongoDB _id
  @Post(':id/modules/:moduleId/lessons')
  async createLesson(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() lessonData: { title: string; content: string },
  ): Promise<any> {
    if (!lessonData.title || !lessonData.content) {
      throw new BadRequestException('title and content are required to create a lesson.');
    }
  
    return await this.courseService.createLessonForModule(courseId, moduleId, lessonData);
  }
  

  // Get all courses
  @Get()
  async getAllCourses() {
    return await this.courseService.findAll();
  }

  // Get a specific course by MongoDB _id
  @Get(':id')
  async getCourseById(@Param('id') courseId: string) {
    const course = await this.courseService.findCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
    return course;
  }

  // Update a course by MongoDB _id
  @Patch(':id')
  async updateCourse(
    @Param('id') courseId: string,
    @Body()
    updatedData: Partial<{
      title: string;
      description: string;
      instructor: string;
      difficultyLevel: string;
    }>,
  ) {
    return await this.courseService.updateCourse(courseId, updatedData);
  }
}
