import { Controller, Post, Body, Param, Get, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StudentQuizzesService } from './student-quizzes.service';
import { SubmitResponseDto } from './dto/response.dto';
import { Quiz } from './schemas/quiz.schema';
import { Question } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { Types } from 'mongoose';


@Controller('student/quizzes')
export class StudentQuizzesController {
  constructor(private readonly studentQuizzesService: StudentQuizzesService) {}

  @Post('start/:quizId')
async startQuiz(
  @Param('quizId') quizId: string,
  @Body('userId') userId: string,
): Promise<{ response: QuizResponse; questions: Question[] }> {
  try {
  const {response, questions} = await this.studentQuizzesService.startQuiz(quizId, userId);
  return  {response, questions};
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof ForbiddenException) {
      throw new ForbiddenException(error.message);
    }
    throw new BadRequestException('An error occurred while starting the quiz');
  }
}

@Post('/submit/:userId/:quizId')
  async submitQuiz(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
    @Body() submittedAnswers: { questionId: string; answer: string }[],
  ) {
    return this.studentQuizzesService.submitQuiz(quizId, userId, submittedAnswers);
  }

  @Get('/user-response/:userId/:quizId')
  async getUserQuizResponse(
    @Param('quizId') quizId: string,
    @Param('userId') userId: string,
  ): Promise<QuizResponse> {
    return this.studentQuizzesService.getUserResponse(quizId, userId);
  }
  



}