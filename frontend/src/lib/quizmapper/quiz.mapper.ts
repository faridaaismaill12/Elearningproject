import { QuizResponse, QuizSubmissionResult } from '@/app/types/quiz';

export const mapQuizResponseToSubmissionResult = (response: QuizResponse): QuizSubmissionResult => {
  return {
    score: response.score,
    correctAnswers: response.correctAnswers,
    totalQuestions: response.totalAnswered,
    feedback: response.answers.map(answer => ({
      questionId: answer.questionId,
      selectedAnswer: answer.answer,
      correctAnswer: '',
    })),
  };
};