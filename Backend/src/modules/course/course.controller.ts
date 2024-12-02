import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './schemas/course.schema';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

    // Delete a course by ID
    @Delete(':id')
    async deleteCourse(@Param('id') id: string) {
        const result = await this.courseService.deleteCourseById(id);
        if (!result) {
            throw new NotFoundException(`Course not found`);
        }
        return { message: `Course successfully deleted` };
    }

    @Put(':id/finish')
    async markAsFinished(@Param('id') lessonId: string, @Body('userId') userId: string) {
        return this.courseService.markLessonAsCompleted(lessonId, userId);
    }

}
