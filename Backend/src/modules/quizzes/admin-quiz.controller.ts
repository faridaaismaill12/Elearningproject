import { Body, Controller, Post, Put, Param,Get, Patch, Delete } from '@nestjs/common';
import { AdminQuizzesService } from './admin-quiz.service'
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuestionDto, UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './schemas/quiz.schema';
import { CreateQuestionDto } from './dto/create-quiz.dto';
import { Question } from './schemas/question.schema';
import { NotFoundException , BadRequestException} from '@nestjs/common';


//admin logic :)
@Controller('admin/quizzes')
export class AdminQuizzesController {
  constructor(private readonly adminQuizzesService: AdminQuizzesService) {}






}
