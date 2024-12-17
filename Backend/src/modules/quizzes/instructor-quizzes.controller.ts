import { Body, Controller, Post, Put, Param,Get, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { InstructorQuizzesService } from './instructor-quizzes.service'
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuestionDto, UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './schemas/quiz.schema';
import { CreateQuestionDto } from './dto/create-quiz.dto';
import { Question } from './schemas/question.schema';
import { NotFoundException , BadRequestException} from '@nestjs/common';
import { QuizResponse } from './schemas/response.schema';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RolesGuard } from '../security/guards/role.guard';
import { Roles } from '../../decorators/roles.decorators'; 
import { Types } from 'mongoose';


//instructor logic :)
@Controller('instructor/quizzes')
@UseGuards(JwtAuthGuard,RolesGuard)

export class InstructorQuizController {
  constructor(private readonly instructorQuizzesService: InstructorQuizzesService) {}
  //done
  @Roles('instructor')
  @Post('/add')
  async insertQuestionToQuestionBank(@Body() createQuestionDto: CreateQuestionDto, @Req() req: any) {
    createQuestionDto.createdBy = req.user.id;
    return this.instructorQuizzesService.insertQuestionToQuestionBank(createQuestionDto);
  }

    
  @Roles('instructor')
  @Patch('/update/question/:id')
  async updateQuestion( @Param('id') questionId: string,@Body() updateQuestion: UpdateQuestionDto){
    return this.instructorQuizzesService.updateQuestion(questionId,updateQuestion);
  }

//done
  @Roles('instructor') 
  @Post('/create')
  async createQuiz(@Body() createQuizDto: CreateQuizDto, @Req() req: any) {
    createQuizDto.createdBy = req.user.id;
    console.log(createQuizDto.createdBy)
    console.log(req.user.id)
    return this.instructorQuizzesService.createQuiz(createQuizDto);
  }


  @Roles('instructor')
  @Put(':id')
  async updateQuiz(
    @Param('id') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.instructorQuizzesService.updateQuiz(quizId, updateQuizDto);
  }

    @Roles('instructor')
  @Get(':quizId')
async getQuizById(@Param('quizId') quizId: string) {
  console.log(`Received quizId: ${quizId}`);  // Ensure this log is outputted
  return await this.instructorQuizzesService.getQuiz(quizId);
}

//done
@Roles('instructor')
@Get('all/:moduleId')
async getQuizzesByModule(@Param('moduleId') moduleId: string) {
  console.log(`Received quizId: ${moduleId}`);  // Ensure this log is outputted
  return await this.instructorQuizzesService.getQuizzes(moduleId);
}

@Roles('instructor')
@Patch('update/:quizId')
async updateQuizById(
  @Param('quizId') quizId: string,
  @Body() updateQuizDto: UpdateQuizDto,
) {
  return this.instructorQuizzesService.updateQuiz(quizId, updateQuizDto);
}

//done
@Roles('instructor')
@Delete('delete/:quizId')
async deleteQuizById(
  @Param('quizId') quizId: string,
) {
  return this.instructorQuizzesService.deleteQuiz(quizId);
}

@Roles('instructor')
@Delete('delete/question/:questionId')
async deleteQuestionById(
  @Param('questionId') questionId: string,
) {
  return this.instructorQuizzesService.deleteQuestion(questionId);
}

@Roles('instructor')
@Get('module/:moduleId/question/:questionId')
async getQuestionByModule(
  @Param('moduleId') moduleId: string,
  @Param('questionId') questionId: string,
): Promise<Question> {
    return await this.instructorQuizzesService.getQuestionByModule(moduleId, questionId);
 
}

@Roles('instructor')
@Get('module/:moduleId')
async getQuestionsByModule(
  @Param('moduleId') moduleId: string,
): Promise<Question[]> {
    return await this.instructorQuizzesService.getQuestionsByModule(moduleId);
 
}

@Roles('instructor')
@Get('/quiz-responses/:userId/:quizId')
async findResponsesForQuiz(@Param('userId') userId: string,@Param('quizId') quizId:string): Promise<QuizResponse[]> {
    return await this.instructorQuizzesService.findResponsesForQuiz(userId,quizId);
}



  
}


