import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentDashboardService } from './student-dashboard.service';
import { QuizResponse, ResponseSchema } from '../quizzes/schemas/response.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Course, CourseSchema } from '../course/schemas/course.schema';
import { Module as CourseModule, ModuleSchema } from '../course/schemas/module.schema';
import { Lesson, LessonSchema } from '../course/schemas/lesson.schema';
import { Quiz, QuizSchema } from '../quizzes/schemas/quiz.schema';
import { InstructorDashboardService } from './instructor-dashboard.service';
import { StudentDashboardController } from './student-dashboard.controller';
import { InstructorDashboardController } from './instructor-dashboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizResponse.name, schema: ResponseSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: CourseModule.name, schema: ModuleSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
  ],
  controllers: [StudentDashboardController , InstructorDashboardController],
  providers: [StudentDashboardService , InstructorDashboardService],
  exports: [StudentDashboardService , InstructorDashboardService],  // export if used in other modules
})
export class DashboardModule {}