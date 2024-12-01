import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';

@Module({
  imports:[  MongooseModule.forFeature([{ name: 'Course', schema: CourseSchema }])],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}