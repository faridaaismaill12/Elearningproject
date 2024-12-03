import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document,  Schema as MongooseSchema , Model} from "mongoose";
import { Course } from './schemas/course.schema';
import { Lesson,LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private courseModel: Model<Course>) { }
        
        //delete course by id
        async deleteCourseByInstructor(courseId: string): Promise<string> {
        // Find the course by ID
        const course = await this.courseModel.findById(courseId);
    
        if (!course) {
          throw new NotFoundException(`Course not found`);
        }
    
        // Check if the course belongs to the instructor
        if (course.instructor.toString() !== 'instructor') {
          throw new ForbiddenException('You are not authorized to delete this course',);
        }
    
        // Delete the course
        await this.courseModel.findByIdAndDelete(courseId);
    
        return `Course has been deleted successfully.`;
      }
      
      
    
      
}
