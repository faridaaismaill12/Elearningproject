import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { User } from '../user/schemas/user.schema';
import { Module, ModuleDocument } from '../course/schemas/module.schema';

@Injectable()
export class AdminQuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Response.name) private responseModel: Model<Response>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
  ) {}

  async getQuizzes():Promise<Quiz[]>{
  
    const quizzes = await this.quizModel.find().sort({ createdAt: -1 });

    if(!quizzes){
        throw new NotFoundException("No quizzes avaiable");
    }

    return quizzes;
  }

  async deleteQuiz(quizId:string):Promise<void>{
    const quiz = await this.quizModel.findById(quizId);

    if(!quiz){
        throw new NotFoundException('Quiz not found');
    }
    quiz.deleteOne();
  }

  



}