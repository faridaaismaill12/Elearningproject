import { Controller, Post, Body, Param, Get, NotFoundException, ForbiddenException, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { StudentQuizzesService } from './student-quizzes.service';
import { SubmitResponseDto } from './dto/response.dto';
import { Quiz } from './schemas/quiz.schema';
import { Question } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorators'; 


@Controller('student/quizzes')
@UseGuards(JwtAuthGuard,RolesGuard)

export class StudentQuizzesController {
  constructor(private readonly studentQuizzesService: StudentQuizzesService) {}

  @Roles('student')
  @Post('start/:quizId')
async startQuiz(
  @Param('quizId') quizId: string,
  //@Body('userId') userId: string,
  @Req() req: any,
): Promise<{ response: QuizResponse; questions: Question[] }> {
  try {
  const userId = req.user.id;
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
@Roles('student')
@Post('/submit/:quizId')
  async submitQuiz(
    @Param('quizId') quizId: string,
    //@Param('userId') userId: string,
    @Req() req: any,
    @Body('submittedAnswers') submittedAnswers: { questionId: string; answer: string }[],
  ) {
    const userId = req.user.id;
    console.log('userId', userId);
    console.log(submittedAnswers);
    return this.studentQuizzesService.submitQuiz(quizId, userId, submittedAnswers);
  }

  @Roles('student')
  @Get('/user-response/:quizId')
  async getUserQuizResponse(
    @Param('quizId') quizId: string,
    @Req() req: any,
  ): Promise<QuizResponse> {
    const userId = req.user.id;
    return this.studentQuizzesService.getUserResponse(userId, quizId);
  }
  
  }
  

  



