import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('Course')
export class CourseController {
    constructor(private courseService: CourseService) { }

    //see course details
    @Get(':id')// /courses/:id   // Get a single course by ID
    async getCourseById(@Param('id') id: string) {
        const course = await this.courseService.findById(id);
        return course;
    }
}
