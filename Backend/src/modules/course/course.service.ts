
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  ) {}

  // Create a course
  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const newCourse = new this.courseModel(courseData);
    return newCourse.save();
  }

  // Get all courses
  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  // Create a module for a specific course
  async createModuleForCourse(courseId: string, moduleData: { moduleId: string; title: string; content: string }): Promise<any> {
    // Find the course by courseId
    const course = await this.courseModel.findOne({ courseId });
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    // Check for duplicate moduleId
    const existingModule = course.modules.find((module) => module.moduleId === moduleData.moduleId);
    if (existingModule) {
      throw new Error('Module with ID ${moduleData.moduleId} already exists in this course.');
    }

    // Add the new module to the course's modules array
    course.modules.push({ ...moduleData, lessons: [] });
    await course.save();

    return course;
  }

  // Create a lesson for a specific module
  async createLessonForModule(courseId: string, moduleId: string, lessonData: { lessonId: string; title: string; content: string }): Promise<any> {
    // Find the course by courseId
    const course = await this.courseModel.findOne({ courseId });
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    // Find the module within the course
    const module = course.modules.find((mod) => mod.moduleId === moduleId);
    if (!module) {
      throw new NotFoundException('Module with ID ${moduleId} not found in course ${courseId}.');
    }

    // Check for duplicate lessonId
    const existingLesson = module.lessons.find((lesson) => lesson.lessonId === lessonData.lessonId);
    if (existingLesson) {
      throw new Error('Lesson with ID ${lessonData.lessonId} already exists in module ${moduleId}.');
    }

    // Add the new lesson to the module's lessons array
    module.lessons.push(lessonData);
    await course.save();

    return course;
  }

  // Get a specific course by ID
  async findCourseById(courseId: string): Promise<Course> {
    const course = await this.courseModel.findOne({ courseId });
    if (!course) {
      throw new NotFoundException('Course with ID ${courseId} not found');
    }

    return course;
  }
}