import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private courseModel: mongoose.Model<Course>
    ) { }

     
    async findById(id: string): Promise<Course> {
        const course = await this.courseModel.findById(id);  
       if(!course) {
        throw new NotFoundException('course not found')
       }
        return course;

    }
}
