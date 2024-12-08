import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { LessonSchema } from './schemas/lesson.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleSchemaDef } from './schemas/module.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaDef },
      {name: 'Lesson', schema:LessonSchema},
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService,MongooseModule],
})
export class CourseModule {}