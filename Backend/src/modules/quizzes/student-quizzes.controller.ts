import { Controller, Post, Body, Param, Get, NotFoundException, ForbiddenException, BadRequestException, UseGuards, Req,Put, Patch, InternalServerErrorException } from '@nestjs/common';
import { StudentQuizzesService } from './student-quizzes.service';
import { SubmitResponseDto } from './dto/response.dto';
import { Quiz } from './schemas/quiz.schema';
import { Question } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorators'; 
import { User } from '../user/schemas/user.schema';


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
    console.log('userId', userId);
    return this.studentQuizzesService.getUserResponse(userId, quizId);
  }
  

  @Roles('student')  
  @Get('average-scores/:courseId')
  async getAverageScores(
    @Param('courseId') courseId: string,
    @Req() req: any,
  ): Promise<{ averageScore: number }> {
    const userId = req.user.id;  
    try {
      const averageScore = await this.studentQuizzesService.getAverageScores(courseId, userId);  
      return { averageScore };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);  
      }
      throw new BadRequestException('An error occurred while calculating the average score'); 
    }

  }
    
  @Roles('student')
  @Get(':moduleId/:quizId')
  async getQuiz(
    @Param('moduleId') moduleId: string,
    @Param('quizId') quizId: string,
  ): Promise<Quiz> {
    console.log('Fetching quiz with moduleId:', moduleId, 'and quizId:', quizId);
  
    try {
      const quiz = await this.studentQuizzesService.getQuiz(moduleId, quizId);
      console.log('Quiz fetched successfully:', quiz);
      return quiz;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  }
  











  
  
    




