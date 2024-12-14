import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  //delete course by id
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteCourseByInstructor(
    @Param('id') courseId: string,
    @Req() req: any
  ) {
    const instructorId = req.user.id;
    return this.courseService.deleteCourseByInstructor(instructorId, courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('hierarchical-content')
  async getHierarchicalContentByInstructor(
    @Query('instructorId') instructorId: string,
  ) {
    return this.courseService.getHierarchicalContent(instructorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/filtered-content')
  async getFilteredContent(
    @Param('id') courseId: string,
    @Req() req: any,
  ) {
    const user = req.user; // Assuming user is attached to the request
    const role = user.role; // Extract role from the JWT payload
    return this.courseService.getFilteredContent(role, courseId);
  }

}
