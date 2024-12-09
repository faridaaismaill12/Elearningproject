import { Module as Modules } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schemas/quiz.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { QuizResponse, ResponseSchema } from './schemas/response.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import {Module, ModuleSchema} from '../course/schemas/module.schema'
import { InstructorQuizController } from './instructor-quizzes.controller';  // Make sure the path is correct
import { InstructorQuizzesService } from './instructor-quizzes.service';
import { StudentQuizzesController } from './student-quizzes.controller';
import { StudentQuizzesService } from './student-quizzes.service';

@Modules({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MongooseModule.forFeature([{ name: Question.name, schema: QuestionSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Module.name, schema: ModuleSchema }]),
    MongooseModule.forFeature([{ name: QuizResponse.name, schema: ResponseSchema}]),
  ],
  controllers: [InstructorQuizController,StudentQuizzesController],  // Make sure the controller is correct
  providers: [InstructorQuizzesService,StudentQuizzesService],
})
export class QuizzesModule {}
