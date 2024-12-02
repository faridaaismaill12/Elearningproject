import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document,  Schema as MongooseSchema , Model} from "mongoose";
import { Course } from './schemas/course.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { Lesson,LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private courseModel: Model<Course>
    ) { }
    
    async deleteCourseById(id: string): Promise<boolean> {
        const course = await this.courseModel.findById(id).exec();
        if (!course) {
          return false;
        }

        // Check for associated modules (if needed)
        const hasModules = await this.courseModel.exists({ courseId: id }).exec();
        if (hasModules) {
          throw new BadRequestException(`Course cannot be deleted`);
        }
      
        // Proceed with deletion
        await this.courseModel.findByIdAndDelete(id).exec();
        return true;
    }
    
    async markLessonAsCompleted(lessonId: string, userId: string): Promise<LessonDocument> {
        const lesson = (await this.courseModel.findById(lessonId)) as LessonDocument;
      
        if (!lesson) {
          throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
        }
      
        // Check if the user already marked this lesson as finished
        const alreadyCompleted = lesson.completions.some(
          (completion) => completion.userId.toString() === userId
        );
      
        if (alreadyCompleted) {
          throw new Error('Lesson already marked as completed by this user');
        }
      
        // Add the user's completion record
        lesson.completions.push({
          userId,
          completedAt: new Date(),
        });
      
        return await lesson.save();
      }
      
}
