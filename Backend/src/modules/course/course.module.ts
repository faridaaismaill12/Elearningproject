import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course_controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }])],
  controllers: [CourseController], // Register controller here
  providers: [CourseService],      // Register service here
})
export class CourseModule {}
