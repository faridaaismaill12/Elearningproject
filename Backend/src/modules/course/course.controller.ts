import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  Get,
  Patch,
  Delete,
  NotFoundException,
  Res,
  UseInterceptors,
  UploadedFiles,

} from '@nestjs/common';
import { Response } from 'express';

import { CourseService } from './course.service';
import { Course } from './schemas/course.schema';
import { Types } from 'mongoose';
import { Question } from '../quizzes/schemas/question.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Multer storage configuration for file upload

const storage = diskStorage({
  destination: './uploads', // Folder to store files
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});




@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // Create a course
  @Post()
async createCourse(
  @Body()
  courseData: {
    title: string;
    description: string;
    instructor: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    keywords?: string[]; // Allow keywords as optional
  },
) {
  return await this.courseService.createCourse(courseData);
}


  // Create a module for a specific course
  @Post(':id/modules')
@UseInterceptors(FilesInterceptor('files', 10, { storage }))
async createModule(
  @Param('id') courseId: string,
  @Body()
  moduleData: { title: string; content: string; difficultyLevel: 'easy' | 'medium' | 'hard' },
  @UploadedFiles() files: Express.Multer.File[],
) {
  console.log('Module Data:', moduleData); // Log module data
  console.log('Uploaded Files:', files);  // Log uploaded files

  if (!moduleData.title || !moduleData.content || !moduleData.difficultyLevel) {
    throw new BadRequestException('title, content, and difficultyLevel are required to create a module.');
  }


  const fileLocations = files.map((file) => `uploads/${file.filename}`);

  return await this.courseService.createModuleForCourse(courseId, {
    ...moduleData,
    locations: fileLocations,
  });
}



  // Upload a file to a specific module
  @Post(':id/modules/:moduleId/files')
  @UseInterceptors(FilesInterceptor('files', 10, { storage })) // Allow up to 10 files
  async uploadFilesToModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @UploadedFiles() files: Express.Multer.File[], // Handle multiple files
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file must be uploaded.');
    }

    const fileLocations = files.map((file) => `uploads/${file.filename}`); // Extract file paths

    // Call the service to update the module
    return await this.courseService.addFilesToModule(courseId, moduleId, fileLocations);
  }

  // Create a lesson for a specific module using MongoDB _id

  @Post(':id/modules/:moduleId/lessons')
  async createLesson(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() lessonData: { title: string; content: string },
  ): Promise<any> {
    if (!lessonData.title || !lessonData.content) {
      throw new BadRequestException('title and content are required to create a lesson.');
    }

    return await this.courseService.createLessonForModule(courseId, moduleId, lessonData);
  }

  // Get all courses
  @Get()
  async getAllCourses() {
    return await this.courseService.findAll();
  }

  // Get a specific course by MongoDB _id
  @Get(':id')
  async getCourseById(@Param('id') courseId: string) {
    const course = await this.courseService.findCourseById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    return course;
  }

  // Get all modules for a course
  @Get(':id/modules')
  async getAllModulesForCourse(@Param('id') courseId: string) {
    return await this.courseService.findModulesByCourseId(courseId);
  }

  // Update a course by MongoDB _id
  @Patch(':id')
  async updateCourse(
    @Param('id') courseId: string,
    @Body()
    updatedData: Partial<{
      title: string;
      description: string;
      instructor: string;
      difficultyLevel: string;
    }>,
  ) {
    return await this.courseService.updateCourse(courseId, updatedData);
  }

  // Delete a course by instructor
  @Delete(':id')
  async deleteCourseByInstructor(@Param('id') courseId: string) {
    return this.courseService.deleteCourseByInstructor(courseId);
  }

  // Get a specific module by MongoDB _id
  @Get(':id/modules/:moduleId')
  async getModuleById(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    const module = await this.courseService.findModuleById(courseId, moduleId);
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    return module;
  }

  
@Get(':id/modules/:moduleId/files')
async getFilesForModule(
  @Param('id') courseId: string,
  @Param('moduleId') moduleId: string,
  @Res() res: Response,
) {
  return await this.courseService.getFilesForModule(courseId, moduleId, res);
}

@Get('name/:name')
async getCourseByName(@Param('name') courseName: string): Promise<Course> {
  return await this.courseService.findCourseByName(courseName);
}


}
