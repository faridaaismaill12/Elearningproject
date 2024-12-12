import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { LessonSchema } from './schemas/lesson.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDef } from './schemas/module.schema';
import { ModuleService } from './module.service';
import { LessonService } from './lesson.service';
import { ModuleController } from './module.controller';
import { LessonController } from './lesson.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaDef },
      {name: 'Lesson', schema:LessonSchema},
    ]),
  ],
  controllers: [CourseController,ModuleController,LessonController],
  providers: [CourseService,ModuleService,LessonService],
  exports: [CourseService,ModuleService,LessonService, MongooseModule],
})
export class CourseModule {}