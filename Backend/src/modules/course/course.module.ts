import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course_controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';
import { Module as ModuleSchema, ModuleSchema as ModuleModelSchema } from './schemas/module.schema';
import { Lesson, LessonSchema } from './schemas/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: ModuleSchema.name, schema: ModuleModelSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
