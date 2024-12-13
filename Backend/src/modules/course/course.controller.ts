import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CourseService } from './course.service';
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

  // Create a course with optional courseId
    // Create a course
    @Post()
    async createCourse(
      @Body()
      courseData: {
        title: string;
        description: string;
        instructor: string;
        difficultyLevel: string;
        keywords?: string[]; // Optional keywords array
      },
    ) {
      return await this.courseService.createCourse(courseData);
    }


  // Create a module for a specific course using MongoDB _id
// Create a module for a specific course
@Post(':id/modules')
  async createModule(
    @Param('id') courseId: string,
    @Body() moduleData: { title: string; content: string; difficultyLevel: 'easy' | 'medium' | 'hard',questions:Types.Array<Question & Document>;},
  ): Promise<any> {
    if (!moduleData.title || !moduleData.content || !moduleData.difficultyLevel) {
      throw new BadRequestException('title, content, and difficultyLevel are required to create a module.');
    }
    return await this.courseService.createModuleForCourse(courseId, moduleData);
  }


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
      throw new NotFoundException('Course with ID ${courseId} not found');
    }
    return course;
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

  @Delete(':id')
  async deleteCourseByInstructor(
    @Param('id') courseId: string,) {
    return this.courseService.deleteCourseByInstructor(courseId);
  }

  
}