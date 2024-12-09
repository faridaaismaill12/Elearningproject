import { Body, Controller, Post, Put, Param,Get, Patch, Delete } from '@nestjs/common';
import { InstructorQuizzesService } from './instructor-quizzes.service'
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuestionDto, UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './schemas/quiz.schema';
import { CreateQuestionDto } from './dto/create-quiz.dto';
import { Question } from './schemas/question.schema';
import { NotFoundException , BadRequestException} from '@nestjs/common';
import { QuizResponse } from './schemas/response.schema';
//instructor logic :)
@Controller('instructor/quizzes')
export class InstructorQuizController {
  constructor(private readonly instructorQuizzesService: InstructorQuizzesService) {}

  @Post('/add')
  async insertQuestionToQuestionBank(@Body() createQuestionDto: CreateQuestionDto) {
    return this.instructorQuizzesService.insertQuestionToQuestionBank(createQuestionDto);
  }

  @Patch('/update/question/:id')
  async updateQuestion( @Param('id') questionId: string,@Body() updateQuestion: UpdateQuestionDto){
    return this.instructorQuizzesService.updateQuestion(questionId,updateQuestion);
  }


  @Post('/create')
  async createQuiz(@Body() createQuizDto: CreateQuizDto) {
    return this.instructorQuizzesService.createQuiz(createQuizDto);
  }

  @Put(':id')
  async updateQuiz(
    @Param('id') quizId: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.instructorQuizzesService.updateQuiz(quizId, updateQuizDto);
  }
  
  @Get(':quizId')
async getQuizById(@Param('quizId') quizId: string) {
  console.log(`Received quizId: ${quizId}`);  // Ensure this log is outputted
  return await this.instructorQuizzesService.getQuiz(quizId);
}

@Get('all/:moduleId')
async getQuizzesByModule(@Param('moduleId') moduleId: string) {
  console.log(`Received quizId: ${moduleId}`);  // Ensure this log is outputted
  return await this.instructorQuizzesService.getQuizzes(moduleId);
}

@Patch('update/:quizId')
async updateQuizById(
  @Param('quizId') quizId: string,
  @Body() updateQuizDto: UpdateQuizDto,
) {
  return this.instructorQuizzesService.updateQuiz(quizId, updateQuizDto);
}

@Delete('delete/:quizId')
async deleteQuizById(
  @Param('quizId') quizId: string,
) {
  return this.instructorQuizzesService.deleteQuiz(quizId);
}

@Delete('delete/question/:questionId')
async deleteQuestionById(
  @Param('questionId') questionId: string,
) {
  return this.instructorQuizzesService.deleteQuestion(questionId);
}

@Get('module/:moduleId/question/:questionId')
async getQuestionByModule(
  @Param('moduleId') moduleId: string,
  @Param('questionId') questionId: string,
): Promise<Question> {
    return await this.instructorQuizzesService.getQuestionByModule(moduleId, questionId);
 
}

@Get('module/:moduleId')
async getQuestionsByModule(
  @Param('moduleId') moduleId: string,
): Promise<Question[]> {
    return await this.instructorQuizzesService.getQuestionsByModule(moduleId);
 
}

@Get('/quiz-responses/:userId/:quizId')
async findResponsesForQuiz(@Param('userId') userId: string,@Param('quizId') quizId:string): Promise<QuizResponse[]> {
    return await this.instructorQuizzesService.findResponsesForQuiz(userId,quizId);
}



  
}