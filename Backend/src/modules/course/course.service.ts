
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { Module as ModuleSchema, ModuleDocument } from './schemas/module.schema';
import { Lesson, LessonDocument } from './schemas/lesson.schema';
import archiver from 'archiver';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';


const rootPath = path.resolve(__dirname, '..', '..'); // Adjust if necessary
@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(ModuleSchema.name) private moduleModel: Model<ModuleDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
  ) {}

  // Other service methods
  


  // Create a course
  async createCourse(courseData: Partial<Course>, instructorEmail: string): Promise<Course> {
    const newCourse = new this.courseModel({
      ...courseData,
      instructor: instructorEmail, // Set instructor's email
    });
  
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
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    return course;
  }

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
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }
  
    const newModule = new this.moduleModel({
      ...moduleData,
      courseId,
      lessons: [],
    });
  
    const savedModule = await newModule.save();
  
    // Save module information in the course's modules array (if required)
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
      throw new NotFoundException(`Module with ID ${moduleId} not found in course ${courseId}.`);
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
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
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
  
    // Find the course
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }
  
    // Find the module
    const module = await this.moduleModel.findById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }
  
    // Generate a unique lesson ID
    const lessonId = new Types.ObjectId().toString();
  
    // Create the new lesson document
    const newLesson = {
      lessonId,
      title: lessonData.title,
      content: lessonData.content,
      moduleId: moduleId,
      order: module.lessons.length + 1, // Assuming order is incremental
      objectives: [],
      completions: [],
      resources: [],
    };
  
    // Save the lesson in the Lesson collection
    const createdLesson = new this.lessonModel(newLesson);
    await createdLesson.save();
  
    // Add the lesson to the lessons array in the Module collection
    module.lessons.push({
      title: lessonData.title,
      content: lessonData.content,
    });
    await module.save();
  
    // Add the lesson to the lessons array in the Course collection
    const courseModule = course.modules.find(
      (mod) => mod._id?.toString() === moduleId,
    );
    if (courseModule) {
      courseModule.lessons.push({
        title: lessonData.title,
        content: lessonData.content,
      });
      await course.save();
    }
  
    return createdLesson;
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
      throw new NotFoundException(`Course with ID ${courseId} not found.`);
    }

    return updatedCourse;
  }


  async getFilesForModule(
    courseId: string,
    moduleId: string,
    res: Response,
  ): Promise<void> {
    const module = await this.findModuleById(courseId, moduleId);
  
    if (!module || !module.locations || module.locations.length === 0) {
      throw new NotFoundException(`No files found for module ${moduleId}.`);
    }
  
    // Resolve paths relative to the root directory
    const filePaths = module.locations.map((location) =>
      path.join(process.cwd(), location), // Use process.cwd() for the root project directory
    );
  
    // Check that all files exist
    filePaths.forEach((filePath) => {
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException(`File not found: ${filePath}`);
      }
    });
  
    // Check if there are multiple files
    if (filePaths.length > 1) {
      // Create a ZIP archive for multiple files
      const archive = archiver('zip', { zlib: { level: 9 } });
      const zipFileName = `module_${moduleId}_files.zip`;
  
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${zipFileName}"`,
      );
  
      archive.pipe(res);
  
      // Add files to the ZIP
      filePaths.forEach((filePath) => {
        archive.file(filePath, { name: path.basename(filePath) });
      });
  
      // Finalize the ZIP
      await archive.finalize();
    } else {
      // If there's only one file, serve it directly
      const filePath = filePaths[0];
      const fileName = path.basename(filePath);
  
      res.download(filePath, fileName); // Serve the single file for download
    }
  }

  //get a course by name
  async findCourseByName(courseName: string): Promise<Course> {
    if (!courseName || courseName.trim() === '') {
      throw new BadRequestException('Course name must be provided.');
    }
  
    const course = await this.courseModel
      .findOne({ title: { $regex: new RegExp(`^${courseName}$`, 'i') } })
      .exec();
  
    if (!course) {
      throw new NotFoundException(`Course with name "${courseName}" not found.`);
    }
  
    return course;
  }
  
  //update module
  async updateModule(
    courseId: string,
    moduleId: string,
    updatedData: Partial<{ title: string; content: string; difficultyLevel: 'easy' | 'medium' | 'hard' }>,
  ): Promise<ModuleSchema> {
    // Validate IDs
    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(moduleId)) {
      throw new BadRequestException('Invalid course or module ID format.');
    }
  
    // Check if the course exists
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException(`Course with ID ${courseId} not found.`);
  
    // Find the module
    const module = await this.moduleModel.findById(moduleId);
    if (!module || module.courseId.toString() !== courseId) {
      throw new NotFoundException(`Module with ID ${moduleId} not found in course ${courseId}.`);
    }
  
    // Update the module attributes
    if (updatedData.title) module.title = updatedData.title;
    if (updatedData.content) module.content = updatedData.content;
    if (updatedData.difficultyLevel) module.difficultyLevel = updatedData.difficultyLevel;
  
    // Save the updated module
    const updatedModule = await module.save();
  
    // Optional: Update module references in the Course's "modules" array
    const courseModule = course.modules.find((mod) => mod._id?.toString() === moduleId);
    if (courseModule) {
      courseModule.title = updatedModule.title;
      courseModule.content = updatedModule.content;
      courseModule.difficultyLevel = updatedModule.difficultyLevel;
      await course.save();
    }
  
    return updatedModule;
  }
   // Get courses by instructor email
async findCoursesByInstructor(instructorEmail: string): Promise<Course[]> {
  if (!instructorEmail || instructorEmail.trim() === '') {
    throw new BadRequestException('Instructor email must be provided.');
  }

  const courses = await this.courseModel.find({ instructor: instructorEmail }).exec();

  if (!courses || courses.length === 0) {
    throw new NotFoundException('No courses found for instructor with email ${instructorEmail}.');
  }

  return courses;
}
  

}