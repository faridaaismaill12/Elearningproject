export interface Question {
    _id: string;
    questionText: string;
    options: string[];
    questionType: 'MCQ' | 'TorF';
    correctAnswer: string;
    difficultyLevel: string;
  }
  
  export interface QuizResponse {
    _id: string;
    user: string;
    quiz: string;
    questionsIds: string[];
    answers: Array<{
      questionId: string;
      answer: string;
    }>;
    score: number;
    correctAnswers: number;
    totalAnswered: number;
    startTime: Date;
  }
  
  export interface QuizSubmissionResult {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    feedback: Array<{
      questionId: string;
      selectedAnswer: string | null;
      correctAnswer: string;
    }>;
  }