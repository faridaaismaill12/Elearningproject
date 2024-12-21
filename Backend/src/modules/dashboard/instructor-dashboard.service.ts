import { Injectable } from '@nestjs/common';
import { InjectModel} from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../user/schemas/user.schema';
import { Module, ModuleDocument } from '../course/schemas/module.schema';
import { Course } from '../course/schemas/course.schema';
import { Lesson, LessonDocument } from '../course/schemas/lesson.schema';
import { QuizResponse } from '../quizzes/schemas/response.schema';
import { Quiz} from '../quizzes/schemas/quiz.schema';

@Injectable()
export class InstructorDashboardService {
  constructor(
    @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>){}
  
    //Number of Enrolled Students per course

    //Average Completion Rate

    //Average Quiz Grade by Course
    async averageCourseGrades(courseId: string): Promise<number> {
      if (!Types.ObjectId.isValid(courseId)) {
        throw new BadRequestException('Invalid Course ID');
      }
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }
      const moduleIds = course.modules.map((module) => module._id);
      if (moduleIds.length === 0) {
        throw new NotFoundException('No modules found for this course');
      }
      const quizzes = await this.quizModel.find({ moduleId: { $in: moduleIds } });
      if (quizzes.length === 0) {
        throw new NotFoundException('No quizzes found for this course');
      }
      const quizIds = quizzes.map((quiz) => quiz._id);
      const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
      if (responses.length === 0) {
        return 0;
      }
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      return totalScore / responses.length;
    }
    
    //Average Quiz Grade by Module 
    async averageModuleGrades(moduleId: string): Promise<number> {
      if (!Types.ObjectId.isValid(moduleId)) {
        throw new BadRequestException('Invalid Module ID');
      }
      const quizzes = await this.quizModel.find({ moduleId: { $in: moduleId } });
      if (quizzes.length === 0) {
        throw new NotFoundException('No quizzes found for this course');
      }
      const quizIds = quizzes.map((quiz) => quiz._id);
      const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
      if (responses.length === 0) {
        return 0;
      }
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      return totalScore / responses.length;
    }

    //Average Course Rating

 }

