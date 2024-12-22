import {
  Controller,
  Post,
  Body,
  Param,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
  Get,
  Patch,
  Delete,
  NotFoundException,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CourseService } from './course.service';
import { ModuleService } from './module.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Course } from './schemas/course.schema';
import { Module } from './schemas/module.schema';
import { Lesson } from './schemas/lesson.schema';

import * as fs from 'fs';

import { Types } from 'mongoose';
import archiver from 'archiver';

// Multer storage configuration


const storage = diskStorage({
  destination: './uploads', // Folder to store files
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },

});

const videoStorage = diskStorage({
  destination: './uploads/videos', // Folder to store videos
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard) // Global guard for all endpoints in this controller
export class CourseController {
  constructor(private readonly courseService: CourseService,
    private readonly moduleService: ModuleService,)
  {}

  
  // Create a course - Only instructors can create
  @Roles('instructor') // Ensure only instructors can access this endpoint
  @Post()
  async createCourse(
    @Body() courseData: Partial<Course>,
    @Req() req: any, // Extract the instructor's email from the JWT
  ): Promise<any> {
    const instructorEmail = req.user.email; // Get instructor's email from the JWT token
  
    if (!instructorEmail) {
      throw new BadRequestException('Instructor email is required.');
    }
  
    return this.courseService.createCourse(courseData, instructorEmail);
  }


  // Create a module (Instructor only)
  @Roles('instructor')
  @Post(':id/modules')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async createModule(
    @Param('id') courseId: string,
    @Body() moduleData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const fileLocations = files.map((file) => `uploads/${file.filename}`);
    return this.courseService.createModuleForCourse(courseId, {
      ...moduleData,
      locations: fileLocations,
    });
  }


// Upload a file to a specific module - Only instructors
@Roles('instructor')
@Post(':id/modules/:moduleId/files')
@UseInterceptors(FilesInterceptor('files', 10, { storage }))
async uploadFilesToModule(
  @Param('id') courseId: string,
  @Param('moduleId') moduleId: string,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const fileLocations = files.map((file) => `uploads/${file.filename}`);
  return await this.courseService.addFilesToModule(courseId, moduleId, fileLocations);
}



// Create a lesson for a specific module - Only instructors
@Roles('instructor')
@Post(':id/modules/:moduleId/lessons')
async createLesson(
  @Param('id') courseId: string,
  @Param('moduleId') moduleId: string,
  @Body() lessonData: { title: string; content: string },
): Promise<any> {
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

  // Update a course by ID - Only instructors
  @Roles('instructor')
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

  // Delete a course by instructor - Only instructors and
  @Roles('instructor','admin') // Ensure only instructors can access this endpoint
@Delete(':id')
async deleteCourse(@Param('id') courseId: string) {
  if (!Types.ObjectId.isValid(courseId)) {
    throw new BadRequestException('Invalid course ID format.');
  }
  return await this.courseService.deleteCourseByInstructor(courseId);
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
  ): Promise<void> {
    const module = await this.courseService.findModuleById(courseId, moduleId);
  
    // Check if the module is outdated
    if (module.outdated) {
      res.status(400).json({ message: "The files for this module are outdated." });
      return;
    }
  
    // Existing file handling logic
    if (!module.locations || module.locations.length === 0) {
      throw new NotFoundException(`No files found for module ${moduleId}.`);
    }
  
    const filePaths = module.locations.map((location) =>
      path.join(process.cwd(), location)
    );
  
    if (filePaths.length > 1) {
      const archive = archiver('zip', { zlib: { level: 9 } });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="module_files.zip"`);
      archive.pipe(res);
      filePaths.forEach((filePath) => archive.file(filePath, { name: path.basename(filePath) }));
      await archive.finalize();
    } else {
      const filePath = filePaths[0];
      res.download(filePath, path.basename(filePath));
    }
  }
  



  @Roles('instructor') // Only instructors can access this endpoint
  @Patch(':id/modules/:moduleId')
  async updateModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body()
    updatedData: Partial<{
      title: string;
      content: string;
      difficultyLevel: 'easy' | 'medium' | 'hard';
      outdated: boolean;
    }>,
  ) {
    if (!updatedData || Object.keys(updatedData).length === 0) {
      throw new BadRequestException('At least one attribute must be provided for update.');
    }
  
    return await this.courseService.updateModule(courseId, moduleId, updatedData);
  }
  
// Fetch courses of the logged-in instructor
@Roles('instructor') // Ensure only instructors can access this endpoint
@Get('instructor/my-courses')
async getCoursesOfInstructor(@Req() req: any): Promise<Course[]> {
  const instructorEmail = req.user.email; // Extract the instructor's email from the JWT payload

  if (!instructorEmail) {
    throw new BadRequestException('Instructor email is required.');
  }

  return await this.courseService.findCoursesByInstructor(instructorEmail);
}

@Roles('student')
@Get('student/completed')
async getCompletedCourses(@Req() req: any): Promise<Course[]> {
  const studentId = req.user._id;
  if (!studentId) {
    throw new BadRequestException('Student ID is required.');
  }
  return await this.courseService.getCompletedCoursesForStudent(studentId);
}

@Roles('instructor')
@Get('instructor/course-completions/:courseId')
async getCourseCompletions(
  @Param('courseId') courseId: string,
  @Req() req: any
): Promise<number> {
  return await this.courseService.getCompletedCoursesForInstructor(courseId);
}
@Get(':courseId/modules/:moduleId/lessons')
async getLessonsForModule(
  @Param('courseId') courseId: string,
  @Param('moduleId') moduleId: string
): Promise<any[]> {
  return await this.courseService.getLessonsForModule(courseId, moduleId);
}


@Get(':courseId/modules/:moduleId/lessons/:lessonId')
async getLessonDetails(
  @Param('courseId') courseId: string,
  @Param('moduleId') moduleId: string,
  @Param('lessonId') lessonId: string,
): Promise<any> {
  return this.courseService.getLessonDetails(courseId, moduleId, lessonId);
}


@Post(':id/modules/:moduleId/videos')
  @UseInterceptors(FilesInterceptor('videos', 10, { storage: videoStorage }))
  async uploadVideosToModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @UploadedFiles() videos: Express.Multer.File[],
  ) {
    const videoLocations = videos.map((video) => `videos/${video.filename}`);
    return await this.courseService.addVideosToModule(courseId, moduleId, videoLocations);
  }

  @Get(':id/modules/:moduleId/videos')
  async getVideosForModule(
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    const module = await this.courseService.findModuleById(courseId, moduleId);
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }
    return module.videos; // Return the videos field
  }



@Get('videos/:filename')
async streamVideo(
  @Param('filename') filename: string,
  @Res() res: Response,
) {
  const filePath = path.join(process.cwd(), 'uploads/videos', filename);
  if (!fs.existsSync(filePath)) {
    throw new NotFoundException(`Video file not found: ${filename}`);
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = res.req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
      return;
    }

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}





}
