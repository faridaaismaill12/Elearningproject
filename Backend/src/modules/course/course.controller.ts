import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';


@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Delete a course by instructor - Only instructors
  @Roles('instructor') // Ensure only instructors can access this endpoint
  @Delete(':id')
  async deleteCourse(
    @Param('id') courseId: string,
  ): Promise<any> {
    return this.courseService.deleteCourseByInstructor(courseId);
}

@Roles('instructor') 
  @Get(':id/filtered-content')
  async getFilteredContent(
    @Param('id') courseId: string,
) {
  return this.courseService.getFilteredContent(courseId);
}

}

