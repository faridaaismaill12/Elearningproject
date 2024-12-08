import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Module as ModuleSchema, ModuleDocument } from './schemas/module.schema';
//import { Question } from '../quizzes/schemas/question.schema';

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
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    return course;
  }


  async deleteCourseByInstructor(courseId: string): Promise<string> {
    // Find the course by ID
    const course = await this.courseModel.findOne({ courseId });

    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    // Check if the instructor exists
    if (!course.instructor) {
      throw new ForbiddenException('The course does not have an instructor assigned.');
    }

    // Check if the course belongs to the instructor
    if (course.instructor.toString() !== 'instructor') {
      throw new ForbiddenException('You are not authorized to delete this course',);
    }

    // Delete the course
    await this.courseModel.deleteOne({ courseId });

    return `Course has been deleted successfully.`;
  }

  

  // // Create a module for a specific course using MongoDB _id
  // async createModuleForCourse(
  //   courseId: string,
  //   moduleData: { title: string; content: string; difficultyLevel: 'easy' | 'medium' | 'hard' ,questions:Types.Array<Question & Document>;},
  // ): Promise<any> {
  //   // Validate course ID
  //   if (!Types.ObjectId.isValid(courseId)) {
  //     throw new BadRequestException('Invalid course ID format.');
  //   }
  
  //   // Ensure the course exists
  //   const course = await this.courseModel.findById(courseId);
  //   if (!course) {
  //     throw new NotFoundException('Course with ID ${courseId} not found.');
  //   }
  
  //   // Validate difficultyLevel
  //   if (!['easy', 'medium', 'hard'].includes(moduleData.difficultyLevel)) {
  //     throw new BadRequestException('Invalid difficultyLevel. Valid options are: easy, medium, hard.');
  //   }
  
  //   // Create and save the module in the modules collection
  //   const newModule = new this.moduleModel({
  //     ...moduleData,
  //     courseId,
  //     lessons: [], // Default empty lessons
  //   });
  
  //   const savedModule = await newModule.save();
  
  //   // Add the module reference to the modules array in the course document
  //   const moduleForCourse = {
  //     _id: savedModule._id.toHexString(), // Safely cast _id to string
  //     title: savedModule.title,
  //     content: savedModule.content,
  //     difficultyLevel: savedModule.difficultyLevel,
  //     lessons: savedModule.lessons, // Add lessons array
  //   };
  
  //   course.modules.push(moduleForCourse); // Add to course's modules array
  //   await course.save(); // Save the updated course document
  
  //   // Return the newly created module
  //   return savedModule;
  // }
  


  // Find all modules for a specific course
  async findModulesByCourseId(courseId: string): Promise<ModuleSchema[]> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID format.');
    }
    return this.moduleModel.find({ courseId }).exec();
  }




  // Create a lesson for a specific module in a course using MongoDB _id
  async createLessonForModule(
    courseId: string,
    moduleId: string,
    lessonData: { title: string; content: string },
  ): Promise<any> {
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }
  
    // Find the course by _id
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
  
    // Find the module within the course
    const module = course.modules.find((mod) => mod._id?.toString() === moduleId);
    if (!module) {
      throw new NotFoundException('Module with ID ${moduleId} not found.');
    }
  
    // Add the new lesson to the lessons array
    const newLesson = { ...lessonData }; // MongoDB will generate _id
    module.lessons.push(newLesson);
    await course.save();
  
    // Return the newly created lesson
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
        { $set: updatedData }, // Update only the provided fields
        { new: true, runValidators: true }, // Return the updated document and run schema validation
      )
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    return updatedCourse;
  }
}