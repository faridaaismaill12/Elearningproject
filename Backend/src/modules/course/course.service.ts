
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Module as ModuleSchema, ModuleDocument } from './schemas/module.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(ModuleSchema.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  // Create a course
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    if (courseData.courseId) {
      // Check if courseId already exists
      const existingCourse = await this.courseModel.findOne({ courseId: courseData.courseId });
      if (existingCourse) {
        throw new BadRequestException('Course with ID ${courseData.courseId} already exists.');
      }
    }

    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  // Get all courses
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  // Get a specific course by MongoDB _id
  async findCourseById(courseId: string): Promise<Course> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found.');
    }

    return course;
  }

  // Delete a course by instructor
  async deleteCourseByInstructor(courseId: string): Promise<string> {
    const course = await this.courseModel.findOne({ courseId });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    if (!course.instructor) {
      throw new ForbiddenException('The course does not have an instructor assigned.');
    }

    // Simulate instructor verification logic (e.g., compare against authenticated user)
    if (course.instructor.toString() !== 'instructor') {
      throw new ForbiddenException('You are not authorized to delete this course.');
    }

    await this.courseModel.deleteOne({ courseId });

    return 'Course has been deleted successfully.';
  }

  // Create a module for a specific course
  async createModuleForCourse(
    courseId: string,
    moduleData: {
      title: string;
      content: string;
      difficultyLevel: 'easy' | 'medium' | 'hard';
      locations?: string[];
    },
  ): Promise<ModuleSchema> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found.');
    }

    const newModule = new this.moduleModel({
      ...moduleData,
      courseId,
      lessons: [],
    });

    const savedModule = await newModule.save();

    course.modules.push({
      _id: savedModule._id.toHexString(),
      title: savedModule.title,
      content: savedModule.content,
      difficultyLevel: savedModule.difficultyLevel,
      lessons: savedModule.lessons,
    });

    await course.save();

    return savedModule;
  }


  async addFilesToModule(courseId: string, moduleId: string, fileLocations: string[]): Promise<ModuleSchema> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }

    // Find the module by ID
    const module = await this.moduleModel.findById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundException('Module with ID ${moduleId} not found in course ${courseId}.');
    }

    // Add the new file locations to the locations array
    module.locations = [...module.locations, ...fileLocations];

    // Save the updated module
    return module.save();
  }



  // Get all modules for a specific course
  async findModulesByCourseId(courseId: string): Promise<ModuleSchema[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }

    return this.moduleModel.find({ courseId }).exec();
  }

  // Get a specific module by MongoDB _id
  async findModuleById(courseId: string, moduleId: string): Promise<ModuleSchema> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }

    const module = await this.moduleModel.findById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundException('Module with ID ${moduleId} not found.');
    }

    return module;
  }

  // Create a lesson for a specific module in a course
  async createLessonForModule(
    courseId: string,
    moduleId: string,
    lessonData: { title: string; content: string },
  ): Promise<any> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found.');
    }

    const module = course.modules.find((mod) => mod._id?.toString() === moduleId);
    if (!module) {
      throw new NotFoundException('Module with ID ${moduleId} not found.');
    }

    const newLesson = { ...lessonData };
    module.lessons.push(newLesson);
    await course.save();

    return module.lessons[module.lessons.length - 1];
  }

  // Update a course by MongoDB _id
  async updateCourse(courseId: string, updatedData: Partial<Course>): Promise<Course> {
    if ('modules' in updatedData) {
      throw new BadRequestException('Updating the modules attribute is not allowed.');
    }

    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(
        courseId,
        { $set: updatedData },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course with ID ${courseId} not found.');
    }

    return updatedCourse;
  }
}