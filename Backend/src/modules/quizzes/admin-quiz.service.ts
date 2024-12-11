import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { User } from '../user/schemas/user.schema';
import { Module, ModuleDocument } from '../course/schemas/module.schema';

@Injectable()
export class AdminQuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<QuizDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Module.name) private moduleModel: Model<ModuleDocument>,
  ) {}

  async getQuizzes(): Promise<Quiz[]> {
    const quizzes = await this.quizModel.find().sort({ createdAt: -1 }).exec();
    return quizzes; // Returns an empty array if no quizzes exist
  }

  async deleteQuiz(quizId: string): Promise<void> {
    const quiz = await this.quizModel.findById(quizId).exec();

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    await quiz.deleteOne(); // Properly await the deletion
  }
}