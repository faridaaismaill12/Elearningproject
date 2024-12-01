import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Create a course
  @Post()
  async createCourse(@Body() courseData: { courseId: string; title: string; description: string; instructor: string; difficultyLevel: string }) {
    return await this.courseService.createCourse(courseData);
  }

  // Create a module for a specific course
  @Post(':courseId/modules')
  async createModule(
    @Param('courseId') courseId: string,
    @Body() moduleData: { moduleId: string; title: string; content: string },
  ): Promise<any> {
    if (!moduleData.moduleId || !moduleData.title || !moduleData.content) {
      throw new Error('moduleId, title, and content are required to create a module.');
    }

    return await this.courseService.createModuleForCourse(courseId, moduleData);
  }

  // Create a lesson for a specific module in a course
  @Post(':courseId/modules/:moduleId/lessons')
  async createLesson(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() lessonData: { lessonId: string; title: string; content: string },
  ): Promise<any> {
    if (!lessonData.lessonId || !lessonData.title || !lessonData.content) {
      throw new Error('lessonId, title, and content are required to create a lesson.');
    }

    return await this.courseService.createLessonForModule(courseId, moduleId, lessonData);
  }
}
