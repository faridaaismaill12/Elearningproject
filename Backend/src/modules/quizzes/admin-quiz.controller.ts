import { Body, Controller, Post, Put, Param,Get, Patch, Delete, UseGuards } from '@nestjs/common';
import { AdminQuizzesService } from './admin-quiz.service'
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorators'; 

//admin logic :)
@Controller('admin/quizzes')
@UseGuards(JwtAuthGuard,RolesGuard)
export class AdminQuizzesController {
  constructor(private readonly adminQuizzesService: AdminQuizzesService) {}


  @Roles('admin')
  @Get()
  async getQuizzes() {
    return this.adminQuizzesService.getQuizzes();
  }

  @Roles('admin')
  @Delete('/:quizId')
  async deleteQuiz(@Param('quizId') quizId: string) {
    await this.adminQuizzesService.deleteQuiz(quizId);

    return { message: 'Quiz deleted successfully' };
  }



}