import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { ModuleSchema } from './schemas/module.schema';
import { LessonSchema } from './schemas/lesson.schema';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { SecurityModule } from '../security/security.module';

@Module({
  imports:[  MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema} , 
    {name: 'Module', schema:ModuleSchema},
    {name: 'Lesson', schema:LessonSchema}
  ]),SecurityModule],
  providers: [CourseService,ModuleService,LessonService],
  controllers: [CourseController,ModuleController,LessonController]
})
export class CourseModule {}