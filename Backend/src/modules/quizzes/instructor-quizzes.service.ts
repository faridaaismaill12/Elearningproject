import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { CreateQuestionDto, CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { User } from '../user/schemas/user.schema';
import { Course, CourseDocument } from '../course/schemas/course.schema';
import {Module, ModuleDocument} from '../course/schemas/module.schema'
import { UpdateQuestionDto } from './dto/update-quiz.dto';


@Injectable()
export class InstructorQuizzesService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<Quiz>,
  @InjectModel(Question.name) private questionModel: Model<Question>,
  @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
  @InjectModel(User.name) private userModel: Model<User>,
  @InjectModel(Module.name) private moduleModel: Model<Module>,
  @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
) {}

//done testing
async insertQuestionToQuestionBank(createQuestionDto: CreateQuestionDto): Promise<Question> {
  const { moduleId, questionType, options, correctAnswer, difficultyLevel, question ,createdBy } = createQuestionDto;

  // Validate moduleId
  if (!Types.ObjectId.isValid(moduleId)) {
    throw new BadRequestException('Invalid Module Id');
  }

  // Check if the module exists
  const module = await this.moduleModel.findById(moduleId);
  if (!module) {
    throw new NotFoundException('Module not found');
  }
  
  const duplicateQuestion = await this.questionModel.findOne({
    question: question, 
    moduleId: new Types.ObjectId(moduleId),
    questionType,
    difficultyLevel,
  });
  if (duplicateQuestion) {
    throw new BadRequestException('Duplicate question detected. The question already exists in this module.');
  }
  let Options = [];
  if (questionType === 'TorF') {
    Options = ['True', 'False'];
    if (!Array.isArray(options) || options.length !== 2 || !options.includes('True') || !options.includes('False')) {
      throw new BadRequestException(
        'For TorF questions, options must be exactly ["True", "False"].',
      );
    }
    if (correctAnswer !== 'True' && correctAnswer !== 'False') {
      throw new BadRequestException(
        'For TorF questions, the correct answer must be "True" or "False".',
      );
    }
  } else if (questionType === 'MCQ') {
    if (!Array.isArray(options) || options.length !== 4) {
      throw new BadRequestException(
        'For MCQ questions, exactly 4 options are required.',
      );
    }
    Options = options;
    if (!options.includes(correctAnswer)) {
      throw new BadRequestException(
        'The correct answer must be one of the provided options.',
      );
    }
  } else {
    throw new BadRequestException('Invalid questionType provided. Must be "TorF" or "MCQ".');
  }

  let createdQuestion: Question;
  try {
    createdQuestion = await this.questionModel.create({
      moduleId: new Types.ObjectId(moduleId), // Associate question with the module
      question,
      questionType,
      options: Options,
      correctAnswer,
      difficultyLevel,
      createdBy
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new BadRequestException('Error creating question: ' + error.message);
    }
    throw new BadRequestException('Unknown error occurred while creating the question.');
  }

  if (!createdQuestion || !createdQuestion._id) {
    throw new BadRequestException('Failed to create the question.');
  }

  try {
    await this.moduleModel.updateOne(
      { _id: new Types.ObjectId(moduleId) },
      { $push: { questions: createdQuestion._id } }, 
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new BadRequestException(
        'Error adding question to module: ' + error.message,
      );
    }
    throw new BadRequestException('Unknown error occurred while adding question to module.');
  }

  return createdQuestion;
}


//done testing
async createQuiz(createQuizDto: CreateQuizDto): Promise<Quiz> {
  const { name, moduleId, duration, createdBy, numberOfQuestions, quizType } = createQuizDto;
  console.log(CreateQuizDto)
  if (!Types.ObjectId.isValid(moduleId)) {
    throw new BadRequestException('Invalid Module Id');
  }

  const module = await this.moduleModel.findById(moduleId);
  if (!module) {
    throw new NotFoundException("Module not found");
  }

  const nameExist = await this.quizModel.findOne({ name, moduleId});
  if (nameExist) {
    throw new ConflictException("Choose a unique quiz name");
  }

    const createdQuiz = await this.quizModel.create({
    name,
    moduleId: new Types.ObjectId(moduleId),
    numberOfQuestions,
    quizType,
    duration,
    createdBy,
  });

  try {
    await this.moduleModel.updateOne(
      { _id: moduleId },
      { $push: { quizzes: createdQuiz._id } }
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestException("Error adding quiz to module: " + error.message);
    }
    throw new BadRequestException("An unknown error occurred while adding quiz to module.");
  }

  return createdQuiz;
}


//done testing
async getQuiz(quizId: string): Promise<Quiz> {
  
  if (!quizId || !Types.ObjectId.isValid(quizId)) {
    console.log('Invalid Quiz ID:', quizId);
    throw new BadRequestException('Invalid Quiz ID');
  }

  const quizObjectId = new Types.ObjectId(quizId);

  const quiz = await this.quizModel.findById(quizObjectId)
    .populate('name moduleId  duration createdBy numberOfQuestions quizType');

  if (!quiz) {
    console.log('Quiz not found for quizId:', quizId);
    throw new NotFoundException('Quiz not found');
  }

  return quiz;
}
//done testing
async getQuizzes(moduleId: string): Promise<{ name: string; numberOfQuestions: number; quizType: string; duration: number }[]> {
  const module_id = new Types.ObjectId(moduleId);

  const module = await this.moduleModel.findById(module_id).populate({
    path: 'quizzes',
    select: '_id name numberOfQuestions quizType duration difficultyLevel', 
    model: 'Quiz',
  });

  if (!module) {
    throw new NotFoundException("Module not found");
  }

  if (!module.quizzes || module.quizzes.length === 0) {
    throw new NotFoundException("Quizzes not found");
  }

  return module.quizzes.map((quiz: any) => ({
    _id:quiz.id,
    name: quiz.name,
    numberOfQuestions: quiz.numberOfQuestions,
    quizType: quiz.quizType,
    duration: quiz.duration,
  }));
}

async deleteQuiz(moduleId: string, quizId: string): Promise<{ message: string }> {
    const quiz_id = new Types.ObjectId(quizId)
    const quiz = await this.quizModel.findById(quiz_id);

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }
    
    const attemptedUsers = quiz.attemptedUsers || [];

 
    if (attemptedUsers.length > 0) {
      throw new BadRequestException('Quiz cannot be deleted as it has been attempted by users.');
    }

    

    // Step 2: Remove the quiz reference from the module
    const moduleUpdateResult = await this.moduleModel.updateOne(
      { _id: moduleId },
      { $pull: { quizzes: quiz._id } }
    );

    if (moduleUpdateResult.matchedCount === 0) {
      throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }

    // Step 3: Delete the quiz document
    const deleteResult = await this.quizModel.deleteOne({ _id: quizId });

    if (deleteResult.deletedCount === 0) {
      throw new InternalServerErrorException("Failed to delete the quiz document.");
    }

    return { message: "Quiz deleted successfully." };
  
  } 



async deleteQuestion(questionId: string): Promise<{ message: string }> {
  // Log received questionId for debugging
  console.log('Received questionId:', questionId);

  if (!Types.ObjectId.isValid(questionId)) {
    throw new BadRequestException('Invalid Question ID');
  }

  // Try finding the question
  const question = await this.questionModel.findById(new Types.ObjectId(questionId));
  
  // Log the result of the query to check if the question is found
  console.log('Found Question:', question);

  if (!question) {
    throw new NotFoundException('Question not found');
  }

  // Check if the question is in any modules and pull it
  const updateResult = await this.moduleModel.updateOne(
    { questions: questionId },
    { $pull: { questions: questionId } }
  );

  // Log the result of the update query
  console.log('Module Update Result:', updateResult);

  // Proceed with deleting the question
  await question.deleteOne();

  return { message: 'Question deleted successfully' };
}


async updateQuestion(
  questionId: string,
  updatedQuestion: UpdateQuestionDto,
): Promise<Question> {
  if (!Types.ObjectId.isValid(questionId)) {
    throw new BadRequestException('Invalid Question ID');
  }

  const question = await this.questionModel.findById(questionId).exec();
  if (!question) {
    throw new NotFoundException('Question not found');
  }

  // Update fields only if provided
  if (updatedQuestion.question) question.question = updatedQuestion.question;
  if (updatedQuestion.questionType) {
    if (updatedQuestion.questionType === 'TorF') {
      if (!updatedQuestion.options || updatedQuestion.options.length !== 2) {
        throw new BadRequestException(
          'For TorF questions, options must be ["True", "False"].',
        );
      }
      question.questionType = 'TorF';
      question.options = ['True', 'False'];
    } else if (updatedQuestion.questionType === 'MCQ') {
      if (!updatedQuestion.options || updatedQuestion.options.length !== 4) {
        throw new BadRequestException(
          'For MCQ questions, exactly 4 options are required.',
        );
      }
      question.questionType = 'MCQ';
      question.options = updatedQuestion.options;
    } else {
      throw new BadRequestException('Invalid questionType provided.');
    }
  } else if (updatedQuestion.options) {
    question.options = updatedQuestion.options;
  }

  if (updatedQuestion.correctAnswer) question.correctAnswer = updatedQuestion.correctAnswer;
  if (updatedQuestion.difficultyLevel) question.difficultyLevel = updatedQuestion.difficultyLevel;

  await question.save();

  return question;
}


  async updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    if (!Types.ObjectId.isValid(quizId)) {
      throw new BadRequestException('Invalid Quiz ID');
    }

    const quiz = await this.quizModel.findById(quizId)
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (quiz.attemptedUsers.length > 0) {
      throw new BadRequestException('Quiz cannot be deleted as it has been attempted by users.');
    }
 
    if (updateQuizDto.name && updateQuizDto.name !== quiz.name) {
      const existingName = await this.quizModel.findOne({ name: updateQuizDto.name });
      if (existingName) {
        throw new BadRequestException('Choose a unique quiz name');
      }
      quiz.name = updateQuizDto.name;
    }
    

    if (updateQuizDto.moduleId) quiz.moduleId = updateQuizDto.moduleId;
    if (updateQuizDto.duration) quiz.duration = updateQuizDto.duration;
    if (updateQuizDto.quizType) quiz.quizType = updateQuizDto.quizType;
    if(updateQuizDto.numberOfQuestions) quiz.numberOfQuestions = updateQuizDto.numberOfQuestions;

  
    await quiz.save();

    return quiz;
  }

  
  async getQuestionsByModule(moduleId:string):Promise<Question[]>{
  const module_id = new Types.ObjectId(moduleId);

  const module = await this.moduleModel.findById(module_id).populate({
    path: 'questions',
    model: 'Question', 
  });

  if (!module) {
    throw new NotFoundException("Module not found");
  }

  if (!module.questions || module.questions.length === 0) {
    throw new NotFoundException('Questions not found');
}
return module.questions

}

//done testing
async getQuestionByModule(moduleId:string, questionId:string):Promise<Question>{
  const module_id = new Types.ObjectId(moduleId);

  const module = await this.moduleModel.findById(module_id).populate({
    path: 'questions',
    model: 'Question', 
  });

  if (!module) {
    throw new NotFoundException("Module not found");
  }

  if (!module.questions || module.questions.length === 0) {
    throw new NotFoundException('Questions not found');
}

const question = module.questions.find((q: any) => q._id.equals(questionId));

if (!question) {
  throw new NotFoundException('Question not found');
}
return question;

}



async findResponsesForQuiz(userId: string, quizId: string): Promise<QuizResponse[]> {

  const instructor = await this.userModel.findById(new Types.ObjectId(userId));

  if (!instructor || instructor.role !== 'instructor') {
    throw new NotFoundException('Instructor not found or not authorized');
  }  

  const quiz = await this.quizModel.findOne({ 
    _id: new Types.ObjectId(quizId), 
    createdBy: userId
    
  }).populate('name _id duration difficultyLevel quizType');


  if (!quiz) {
    throw new NotFoundException('Quiz not found or you are not the creator of this quiz');
  }
  const responses = await this.responseModel.find({ quiz: new Types.ObjectId(quizId) });

  return responses;
}


async findResponsesForQuiz1(userId: string, quizId: string): Promise<{ quiz: any; responses: QuizResponse[] }> {
  const instructor = await this.userModel.findById(userId);
  if (!instructor || instructor.role !== 'instructor') {
    throw new NotFoundException('Instructor not found or not authorized');
  }

  const quiz = await this.quizModel
    .findOne({ _id: quizId, createdBy: userId })
    .populate('name duration difficultyLevel quizType');

  if (!quiz) {
    throw new NotFoundException('Quiz not found or you are not the creator of this quiz');
  }

  const responses = await this.responseModel.find({ quiz: quizId });
  return { quiz, responses };
}

async averageCourseQuizzes(courseId: string): Promise<number> {
  if (!Types.ObjectId.isValid(courseId)) {
    throw new BadRequestException('Invalid Course ID');
  }
  const course = await this.courseModel.findById(courseId);
  if (!course) {
    throw new NotFoundException('Course not found');
  }
  console.log('Course:', course);

  const moduleIds = course.modules.map((module) => module._id);
  console.log('Module IDs:', moduleIds);

  if (moduleIds.length === 0) {
    throw new NotFoundException('No modules found for this course');
  }

  const quizzes = await this.quizModel.find({ moduleId: { $in: moduleIds } });
  console.log('Quizzes:', quizzes);

  if (quizzes.length === 0) {
    throw new NotFoundException('No quizzes found for this course');
  }

  const quizIds = quizzes.map((quiz) => quiz._id);
  const responses = await this.responseModel.find({ quiz: { $in: quizIds } });
  console.log('Responses:', responses);

  if (responses.length === 0) {
    return 0;
  }

  const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
  return totalScore / responses.length;
}


}