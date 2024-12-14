import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document,  Schema as MongooseSchema , Model} from "mongoose";
import { Course } from './schemas/course.schema';
import { Module, ModuleDocument } from './schemas/module.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private courseModel: Model<Course>,
        @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
        @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>
      ) { }
        
        //delete course by id
        async deleteCourseByInstructor(instructorId: string, courseId: string): Promise<string> {
        
        const instructor = await this.courseModel.findById(instructorId);
        if(!instructor || instructor.role !== "instructor"){
          throw new ForbiddenException('only instructors can delete course')
        }
    
        const course = await this.courseModel.findById(courseId);
        if (!course) {
          throw new NotFoundException(`Course not found`);
        }

        // Check if the instructor exists
        if (!course.instructor) {
          throw new ForbiddenException('The course does not have an instructor assigned.');
        }
    
        // Delete the course
        await this.courseModel.deleteOne({ courseId });
    
        return `Course has been deleted successfully.`;
      }
      
      async getHierarchicalContent(instructorId: string): Promise<any> {
        const courses = await this.courseModel
          .find({ instructor: instructorId })
          .populate({
            path: 'modules',
            populate: {
              path: 'lessons',
              options: { sort: { createdAt: 1 } }, // Sort lessons
            },
            options: { sort: { createdAt: 1 } }, // Sort modules
          })
          .sort({ createdAt: 1 }) // Sort courses
          .lean() // Return plain JavaScript objects for better type handling
          .exec();
      
        if (!courses || courses.length === 0) {
          throw new NotFoundException('No courses found for this instructor');
        }
      
        // Map the results hierarchically
        const result = courses.map((course) => ({
          courseId: course.courseId,
          title: course.title,
          createdAt: course.createdAt,
          modules: (course.modules as any[]).map((module) => ({
            moduleId: module.moduleId,
            title: module.title,
            createdAt: module.createdAt,
            lessons: (module.lessons as any[]).map((lesson) => ({
              lessonId: lesson.lessonId,
              title: lesson.title,
              createdAt: lesson.createdAt,
              order: lesson.order,
            })),
          })),
        }));
      
        return result;
      }

      async getFilteredContent(role: string, courseId: string) {
        // Find the course
        const course = await this.courseModel.findById(courseId)
          .populate({
            path: 'modules',
            populate: {
              path: 'lessons',
              model: 'Lesson',
            },
          });
    
        if (!course) {
          throw new NotFoundException('Course not found');
        }
    
        // Filter outdated content for students
        if (role !== 'instructor') {
          course.modules = course.modules.map((module: any) => {
            module.lessons = module.lessons.filter(
              (lesson: any) => !lesson.isOutdated,
            );
            return module;
          });
        }
    
        return course;
      }
      
}
