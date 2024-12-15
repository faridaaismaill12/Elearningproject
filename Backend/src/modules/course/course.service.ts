import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document,  Schema as MongooseSchema , Model, Types} from "mongoose";
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
 
 // Delete a course by instructor
 async deleteCourseByInstructor(courseId: string): Promise<string> {
  if (!Types.ObjectId.isValid(courseId)) {
    throw new BadRequestException('Invalid course ID format.');
  }

  const course = await this.courseModel.findById(courseId);
  if (!course) {
    throw new NotFoundException('Course not found.');
  }

  await this.courseModel.deleteOne({ _id: courseId });
  return 'Course has been deleted successfully.';
}
      
async getFilteredContent(courseId: string): Promise<any> {
  // Find the course by its MongoDB _id and populate its modules and lessons
  const course = await this.courseModel.findById(courseId)
    .populate({
      path: 'modules',
      populate: {
        path: 'lessons',
        model: 'Lesson', // Ensure this matches your Lesson model name
      },
    });

  if (!course) {
    throw new NotFoundException('Course not found');
  }

  // Ensure the populated modules and lessons exist
  if (!course.modules || !Array.isArray(course.modules)) {
    throw new Error('Modules data is not properly populated.');
  }

  // Return the course data including outdated lessons (visible only to instructors)
  course.modules = course.modules.map((module: any) => {
    module.lessons = module.lessons.map((lesson: any) => {
      // Add an 'isOutdated' flag to the lesson data for instructors
      return {
        ...lesson.toObject(),
        isOutdated: lesson.isOutdated, // Assuming `isOutdated` is a field in the Lesson schema
      };
    });
    return module;
  });

  return course;
}

}
