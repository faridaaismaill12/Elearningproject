import { Body, Controller, Post, Put, Param,Get, Patch, Delete } from '@nestjs/common';
import { AdminQuizzesService } from './admin-quiz.service'


//admin logic :)
@Controller('admin/quizzes')
export class AdminQuizzesController {
  constructor(private readonly adminQuizzesService: AdminQuizzesService) {}


  @Get()
  async getQuizzes() {
    return this.adminQuizzesService.getQuizzes();
  }

  // Corrected: Renamed method to deleteQuiz and ensured a success response
  @Delete('/:quizId')
  async deleteQuiz(@Param('quizId') quizId: string) {
    await this.adminQuizzesService.deleteQuiz(quizId);

    return { message: 'Quiz deleted successfully' };
  }



}