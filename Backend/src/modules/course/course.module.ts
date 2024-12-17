import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDef } from './schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: 'Lesson', schema: LessonSchema },
      { name: 'Module', schema: ModuleSchemaDef },
    ]),
  ],

  controllers: [CourseController,ModuleController,LessonController],
  providers: [CourseService,ModuleService,LessonService],
  exports: [CourseService,ModuleService,LessonService, MongooseModule],

})
export class CourseModule {}
