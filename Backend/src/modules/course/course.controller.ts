import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { Types } from 'mongoose';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  //delete course by id
  @Delete(':id')
  async deleteCourseByInstructor(
    @Param('id') courseId: string,) {
    return this.courseService.deleteCourseByInstructor(courseId);
  }

}
