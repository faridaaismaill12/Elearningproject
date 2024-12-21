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
export class StudentDashboardService {
  constructor(
      @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
      @InjectModel(User.name) private userModel: Model<User>,
      @InjectModel(Module.name) private moduleModel: Model<Module>,
      @InjectModel(Course.name) private courseModel: Model<Course>,
      @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
      @InjectModel(Quiz.name) private quizModel: Model<Quiz>){}
  
//Get Course Progress
   async getCourseProgress(userId: string, courseId: string): Promise<number> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('Invalid user ID format');
    }
    if (!Types.ObjectId.isValid(courseId)) {
      throw new NotFoundException('Invalid course ID format');
    }
  
    const userObjectId = new Types.ObjectId(userId);
    const courseObjectId = new Types.ObjectId(courseId);
  
    // Validate user existence
    const user = await this.userModel.findById(userObjectId);
    if (!user) {
      console.log('User not found:', userId);
      throw new NotFoundException('User not found');
    }
  
    // Validate course existence
    const course = await this.courseModel.findById(courseObjectId).populate('modules');
    if (!course) {
      console.log('Course not found:', courseId);
      throw new NotFoundException('Course not found');
    }
  
    // Retrieve all quizzes in the course's modules
    const quizzes = await this.quizModel.find({
      moduleId: { $in: course.modules.map((module) => module._id) },
    });
    if (quizzes.length === 0) {
      return 0; // No quizzes, no progress
    }
  
    // Retrieve all responses by the user for quizzes in this course
    const responses = await this.responseModel.find({
      user: userObjectId,
      quiz: { $in: quizzes.map((quiz) => quiz._id) },
    });
  
    // Calculate progress based on completed quizzes
    const completedQuizzes = responses.length;
    const totalQuizzes = quizzes.length;
  
    const progress = (completedQuizzes / totalQuizzes) * 100;
  
    console.log(`User: ${userId}, Course: ${courseId}, Progress: ${progress}%`);
  
    return progress;
  }

  //Number of Lessons Completed Today

  //Average Score Per Course
  async averageCourseGrades(userId: string, courseId: string): Promise<number> {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid Course ID');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID');
    }
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const moduleIds = course.modules.map((module) => module._id);
    if (moduleIds.length === 0) {
      throw new NotFoundException('No modules found for this course');
    }

    const quizzes = await this.quizModel.find({ moduleId: { $in: moduleIds } , attemptedUsers:userId});
    
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for this  and User');
    }
    const quizIds = quizzes.map((quiz) => quiz._id);
    const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
    if (responses.length === 0) {
      return 0;
    }
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return totalScore / responses.length;
  }

  //Best Module Score
  async findBestModule(userId: string, courseId: string): Promise<Module> {
    // Validate inputs
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid Course ID');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID');
    }
  
    // Check if course exists
    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Check if user exists
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Ensure modules are defined in the course
    if (!course.modules || course.modules.length === 0) {
      throw new NotFoundException('No modules found for this course');
    }
  
    // Get module IDs from course
    const moduleIds = course.modules.map((module) => module?._id).filter(Boolean);
  
    if (moduleIds.length === 0) {
      throw new NotFoundException('No valid module IDs found for this course');
    }
  
    // Find quizzes the user has attempted in the course
    const quizzes = await this.quizModel.find({
      moduleId: { $in: moduleIds },
      attemptedUsers: userId,
    }).lean();
  
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for this course and user');
    }
  
    // Get quiz IDs
    const quizIds = quizzes.map((quiz) => quiz._id);
  
    // Find responses the user has submitted
    const responses = await this.responseModel.find({ quiz: { $in: quizIds } }).lean();
  
    if (responses.length === 0) {
      throw new NotFoundException('No responses found for the quizzes');
    }
  
    // Calculate scores and map them to quizzes
    const scores = responses.map((response) => ({
      score: response.score,
      quizId: response.quiz,
    }));
  
    // Find the response with the highest score
    const highestScoreResponse = scores.reduce((max, current) => 
      current.score > max.score ? current : max, scores[0]);
  
    // Find the quiz associated with the highest score
    const bestQuiz = quizzes.find((quiz) => quiz._id.toString() === highestScoreResponse.quizId.toString());
  
    if (!bestQuiz) {
      throw new NotFoundException('Unable to find quiz with the highest score');
    }
  
    // Find the module associated with the quiz
    const bestModule = await this.moduleModel.findById(bestQuiz.moduleId);
  
    if (!bestModule) {
      throw new NotFoundException('Unable to find module with the highest score');
    }

    return bestModule;
  }
  
  //Worst Module Score
  async findWorstModule(userId: string, courseId: string): Promise<Module> {
    // Validate inputs
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid Course ID');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID');
    }
  
    // Check if course exists
    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new NotFoundException('Course not found');
    }
  
    // Check if user exists
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Ensure modules are defined in the course
    if (!course.modules || course.modules.length === 0) {
      throw new NotFoundException('No modules found for this course');
    }
  
    // Get module IDs from course
    const moduleIds = course.modules.map((module) => module?._id).filter(Boolean);
  
    if (moduleIds.length === 0) {
      throw new NotFoundException('No valid module IDs found for this course');
    }
  
    // Find quizzes the user has attempted in the course
    const quizzes = await this.quizModel.find({
      moduleId: { $in: moduleIds },
      attemptedUsers: userId,
    }).lean();
  
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for this course and user');
    }
  
    // Get quiz IDs
    const quizIds = quizzes.map((quiz) => quiz._id);
  
    // Find responses the user has submitted
    const responses = await this.responseModel.find({ quiz: { $in: quizIds } }).lean();
  
    if (responses.length === 0) {
      throw new NotFoundException('No responses found for the quizzes');
    }
  
    // Calculate scores and map them to quizzes
    const scores = responses.map((response) => ({
      score: response.score,
      quizId: response.quiz,
    }));
  
    // Find the response with the highest score
    const lowestScoreResponse = scores.reduce((min, current) => 
      current.score < min.score ? current : min, scores[0]);
  
    // Find the quiz associated with the highest score
    const worstQuiz = quizzes.find((quiz) => quiz._id.toString() === lowestScoreResponse.quizId.toString());
  
    if (!worstQuiz) {
      throw new NotFoundException('Unable to find quiz with the lowest score');
    }
  
    // Find the module associated with the quiz
    const worstModule = await this.moduleModel.findById(worstQuiz.moduleId);
  
    if (!worstModule) {
      throw new NotFoundException('Unable to find module with the lowest score');
    }

    return worstModule;
  }
 }
