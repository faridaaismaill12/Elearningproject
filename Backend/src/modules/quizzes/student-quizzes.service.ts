import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Question, QuestionDocument } from './schemas/question.schema';
import { QuizResponse } from './schemas/response.schema';
import { User } from '../user/schemas/user.schema';
import { Module, ModuleDocument } from '../course/schemas/module.schema';
import {Course} from '../course/schemas/course.schema'; // Added Course schema
import { populate } from 'dotenv';
import { LessonDocument } from '../course/schemas/lesson.schema';

@Injectable()
export class StudentQuizzesService {
  constructor(
    @InjectModel(Quiz.name) private quizModel: Model<Quiz>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(QuizResponse.name) private responseModel: Model<QuizResponse>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Course.name) private courseModel: Model<Course>, // Added Course model
  ) {}
  private async generateQuestions(
    numberOfQuestions: number,
    questionType: string,
    quizDifficulties: string[],
  ): Promise<Question[]> {
    const questions: Question[] = [];
    console.log('generateQuestions called with:', {
      numberOfQuestions,
      questionType,
      quizDifficulties,
    });
  
    const getQuestionsFromQuestionBank = async (
      questionType: string,
      difficulty: string,
      count: number,
    ) => {
      console.log('Fetching questions from question bank:', {
        questionType,
        difficulty,
        count,
      });
      const result = await this.questionModel.find({
        questionType,
        difficultyLevel: difficulty,
      }).limit(count);
  
      console.log(`Fetched ${result.length} questions from the question bank`);
      return result;
    };
  
    for (const difficulty of quizDifficulties) {
      console.log(`Processing difficulty: ${difficulty}`);
      if (questionType === 'MCQ') {
        const MCQ = await getQuestionsFromQuestionBank(
          'MCQ',
          difficulty,
          numberOfQuestions - questions.length,
        );
        questions.push(...MCQ);
      }
  
      if (questionType === 'TorF') {
        const TorF = await getQuestionsFromQuestionBank(
          'TorF',
          difficulty,
          numberOfQuestions - questions.length,
        );
        questions.push(...TorF);
      }
  
      if (questionType === 'Both') {
        const count = Math.ceil((numberOfQuestions - questions.length) / 2);
        console.log(`Splitting questions for Both: ${count} each`);
        const MCQ = await getQuestionsFromQuestionBank('MCQ', difficulty, count);
        const TorF = await getQuestionsFromQuestionBank(
          'TorF',
          difficulty,
          numberOfQuestions - questions.length - count,
        );
        questions.push(...MCQ);
        questions.push(...TorF);
      }
  
      console.log(`Collected questions so far: ${questions.length}`);
      // Stop if enough questions are collected
      if (questions.length >= numberOfQuestions) {
        console.log('Enough questions collected, breaking loop.');
        break;
      }
    }
  
    if (questions.length < numberOfQuestions) {
      console.error(
        `Not enough questions available! Collected: ${questions.length}, Required: ${numberOfQuestions}`,
      );
      throw new BadRequestException('Not enough questions available!');
    }
  
    console.log('Final questions:', questions);
    return questions.slice(0, numberOfQuestions);
  }
  
  async startQuiz(
    quizId: string,
    userId: string,
  ): Promise<{ response: QuizResponse; questions: Question[] }> {
    console.log('startQuiz called with:', { quizId, userId });
  

    const quiz = await this.quizModel.findById(quizId).populate('moduleId');
    if (!quiz) {
      console.error(`Quiz not found for quizId: ${quizId}`);
      throw new NotFoundException('Quiz not found');
    }
    console.log('Quiz found:', quiz);
  
    const user = await this.userModel.findById(userId);
    if (!user) {
      console.error(`User not found for userId: ${userId}`);
      throw new NotFoundException('User not found');
    }
    console.log('User found:', user);

    const existingResponse = await this.responseModel.findOne({
      user: new Types.ObjectId(userId),
      quiz: new Types.ObjectId(quizId),
    });
  
    if (existingResponse) {
      console.log('Existing response found. Deleting old response...');
      await this.responseModel.deleteOne({ _id: existingResponse._id });
    }


    let quizDifficulties: string[] = [];
    if (user.studentLevel === 'beginner') {
      quizDifficulties = ['easy'];
    } else if (user.studentLevel === 'average') {
      quizDifficulties = ['easy', 'medium'];
    } else if (user.studentLevel === 'advanced') {
      quizDifficulties = ['easy', 'medium', 'hard'];
    }
    console.log('Quiz difficulties determined:', quizDifficulties);
  
    const questions = await this.generateQuestions(
      quiz.numberOfQuestions,
      quiz.quizType,
      quizDifficulties,
    );
    console.log('Generated questions:', questions);
  
    const questionsIds = questions.map((q) => q._id);
    console.log('Mapped question IDs:', questionsIds);
  
    const response = await this.responseModel.create({
      user: new Types.ObjectId(userId), // Convert userId to ObjectId
      quiz: new Types.ObjectId(quizId), // Convert quizId to ObjectId
      questionsIds,
      answers: [],
      score: 0,
      correctAnswers: 0,
      totalAnswered: 0,
      startTime: new Date(),
    });
    console.log('Quiz response created:', response);
  
    return { response, questions };
    
  }

  
  async submitQuiz(
    quizId: string, 
    userId: string, 
    submittedAnswers: { questionId: string; answer: string }[],
  ): Promise<{ score: number; correctAnswers: number; totalQuestions: number; feedback: any ; timeTaken: number}> {



    const quiz = await this.quizModel.findById(quizId);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
  

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  

    const response = await this.responseModel.findOne({
      user: new Types.ObjectId(userId),
      quiz: new Types.ObjectId(quizId),
    });
    if (!response) {
      throw new NotFoundException('Invalid session');
    }

    if (!response.startTime) {
      throw new BadRequestException('Start time not found in response');
    }

    const questionIds = submittedAnswers.map((a) => {
      if (!Types.ObjectId.isValid(a.questionId)) {
        throw new BadRequestException(`Invalid questionId: ${a.questionId}`);
      }
      return new Types.ObjectId(a.questionId);
    });
  
    const questions = await this.questionModel.find({ _id: { $in: questionIds } });
  
    if (questions.length !== submittedAnswers.length) {
      throw new BadRequestException('Some questions are missing or invalid');
    }

    let correctAnswers = 0;
    const validatedAnswers = submittedAnswers.map((submittedAnswer) => {
      const question = questions.find((q) => q._id.toString() === submittedAnswer.questionId);
      const isCorrect = question?.correctAnswer === submittedAnswer.answer;
      if (isCorrect) correctAnswers++;
      return {
        questionId: new Types.ObjectId(submittedAnswer.questionId),
        answer: submittedAnswer.answer,
      };
    });
    
    response.answers = validatedAnswers; 
    
  

    const feedback = questions.map((question) => {
      const submittedAnswer = submittedAnswers.find(
        (a) => a.questionId === question._id.toString(),
      );
      return {
        questionId: question._id.toString(),
        selectedAnswer: submittedAnswer?.answer || null,
        correctAnswer: question.correctAnswer,
      };
    });
  

    const score = (correctAnswers / questions.length) * 100;

    const currentTime = new Date();
  const timeTaken = Math.floor((currentTime.getTime() - response.startTime.getTime()) / 1000); // in seconds

  
    response.questionsIds = questions.map((q) => q._id); // Map Question ObjectIds to questionsIds
    response.answers = validatedAnswers;
    response.correctAnswers = correctAnswers;
    response.totalAnswered = questions.length;
    response.score = score;
    await response.save();


    await this.quizModel.updateOne(
      { _id: quiz._id },
      { $addToSet: { attemptedUsers: { user: userId } } }
    );
    

    return {
      score,
      correctAnswers,
      totalQuestions: questions.length,
      feedback,
      timeTaken
    };
  }

  async getUserResponse(userId: string, quizId: string): Promise<QuizResponse> {
    if (!Types.ObjectId.isValid(userId)) {
        throw new NotFoundException('Invalid user ID format');
    }
    if (!Types.ObjectId.isValid(quizId)) {
        throw new NotFoundException('Invalid quiz ID format');
    }
    const userObjectId = new Types.ObjectId(userId);
    const quizObjectId = new Types.ObjectId(quizId);
    const user = await this.userModel.findById(userObjectId);
    if (!user) {
        console.log('User not found:', userId);
        throw new NotFoundException('User not found');
    }
    const quiz = await this.quizModel.findById(quizObjectId).populate('name');
    if (!quiz) {
        console.log('Quiz not found:', quizId);
        throw new NotFoundException('Quiz not found');
    }


//all scores for all modules, for a specific course and take the average 
    const response = await this.responseModel.findOne({
        user: userObjectId,
        quiz: quizObjectId,
    }).populate('correctAnswers score totalAnswered');

    if (!response) {
        console.log('Response not found for user:', userId, 'and quiz:', quizId);
        throw new NotFoundException('You have not taken this quiz');
    }

    return response;
}
  
  async upgradeStudentLevel(userId: string): Promise<User> {
    try {
      // Check if the userId is a valid MongoDB ObjectId
      if (!Types.ObjectId.isValid(userId)) {
        throw new NotFoundException('Invalid User ID');
      }

      // Convert userId to ObjectId
      const userObjectId = new Types.ObjectId(userId);

      // Find the user by ObjectId
      const user = await this.userModel.findById(userObjectId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if the user has taken any quizzes
      const userTakenQuizzes = await this.quizModel.find({ attemptedUsers: userObjectId });
      if (userTakenQuizzes.length === 0) {
        throw new NotFoundException('User has not taken any quizzes');
      }

      // Get responses for the quizzes, ensuring quiz and user are ObjectIds
      const responses = await this.responseModel.find({
        user: userObjectId,
        quiz: { $in: userTakenQuizzes.map(quiz => quiz._id) },
      });

      if (responses.length === 0) {
        throw new NotFoundException('No valid responses found for the quizzes taken by the user');
      }

      // Calculate the total score and average score
      const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
      const averageScore = totalScore / responses.length;

      // Determine the new level based on the average score
      let newLevel: string | null = null;

      switch (user.studentLevel) {
        case 'beginner':
          newLevel = averageScore >= 75 ? 'average' : 'beginner';
          break;
        case 'average':
          newLevel = averageScore >= 90 ? 'advanced' : 'average';
          break;
        case 'advanced':
          newLevel = 'advanced';  // No change for advanced
          break;
        default:
          throw new InternalServerErrorException('Invalid student level');
      }

      // If the level has changed, update the user record
      if (newLevel && user.studentLevel !== newLevel) {
        user.studentLevel = newLevel;
        await user.save();
      }

      // Return the updated user
      return user;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;  // Re-throw known exceptions
      }
      throw new InternalServerErrorException('An unexpected error occurred while upgrading the student level');
    }
  }

  async getAverageScores(courseId: string, userId: string): Promise<number> {
    const user = await this.userModel.findById(new Types.ObjectId(userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    const moduleIds = course.modules.map((module) => module._id);
    if (moduleIds.length === 0) {
      throw new NotFoundException('No modules found for this course');
    }
    const quizzes = await this.quizModel.find({ moduleId: { $in: moduleIds } });
    if (quizzes.length === 0) {
      throw new NotFoundException('No quizzes found for this course');
    }
    const quizIds = quizzes.map((quiz) => quiz._id);
    const responses = await this.responseModel.find({
      quiz: { $in: quizIds },
      user: new Types.ObjectId(userId),  
    });
    if (responses.length === 0) {
      return 0;
    }
    const totalScore = responses.reduce((sum, response) => sum + response.score, 0);
    return totalScore / responses.length;
  }
  

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


  async isModuleCompletedByStudent(moduleId: string, userId: string): Promise<boolean> {
    const module = await this.moduleModel.findById(new Types.ObjectId(moduleId)).populate('lessons quizzes');
    if (!module) {
        throw new NotFoundException(`Module with ID ${moduleId} not found.`);
    }

    console.log('user ID' , userId)
    const userObjectId = new Types.ObjectId(userId);

    console.log('USER Object id', userObjectId)

    if (!module.quizzes || module.quizzes.length === 0) {
        throw new NotFoundException(`No quizzes found for module with ID ${moduleId}.`);
    }

    const moduleQuizzes = module.quizzes.map((quiz) => quiz._id);

    console.log('Module quizzes:', moduleQuizzes);

    const responses = await this.responseModel.find({
      user: userObjectId,
      quiz: { $in: moduleQuizzes.map(id => new Types.ObjectId(id)) },  // Cast IDs explicitly to ObjectId
  });
  
    console.log('User responses:', responses);

    const totalScore = responses.reduce((sum, response) => {
        const score = response.score ?? 0; // Default to 0 if score is missing
        return sum + score;
    }, 0);


    const averageScore = totalScore / moduleQuizzes.length;


    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { completedModules: module._id } }  
  );

    // Debug log to check the average score
    console.log('Average Score:', averageScore);

    return averageScore >= 60; // Ensure this threshold is the desired value
}









  

  
}
