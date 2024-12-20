'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import './Quiz.css';
import toast, { Toaster } from 'react-hot-toast';

interface Question {
  _id: string;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer?: string;
  difficultyLevel: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

interface Feedback {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
}



const QuizPage = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState<{ title: string }>({ title: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizResponseId, setQuizResponseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Missing token');
      return;
    }

    axios
      .post(
        `http://localhost:6050/student/quizzes/start/${quizId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setQuiz({ title: response.data.title }); 
        setQuestions(response.data.questions);
        setQuizResponseId(response.data.response._id);
      })
      .catch((error) => {
        console.error('Error fetching quiz:', error);
      });
  }, [quizId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = prevAnswers.filter((item) => item.questionId !== questionId);
      return [...updatedAnswers, { questionId, answer }];
    });
  };

  const allQuestionsAnswered = () => {
    const answeredIds = answers.map((answer) => answer.questionId);
    return questions.every((question) => answeredIds.includes(question._id));
  };

  const handleSubmit = async () => {
    if (!quizResponseId) {
      console.error('Missing quizResponseId');
      return;
    }

    if (!allQuestionsAnswered()) {
      toast.error('You must answer all questions before submitting.');
      return;
    }

    try {
      const submittedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
      }));

      const response = await axios.post(
        `http://localhost:6050/student/quizzes/submit/${quizId}`,
        { submittedAnswers },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );

      const { feedback } = response.data;

      // Save the feedback into state
      const feedbackMap = feedback.reduce((acc: Record<string, Feedback>, curr: Feedback) => {
        acc[curr.questionId] = curr;
        return acc;
      }, {});

      setFeedback(feedbackMap);
      setIsSubmitted(true);

      toast.success(`Quiz Submitted! Your score is: ${response.data.score}`);

      feedback.forEach((item: { selectedAnswer: any; correctAnswer: any; questionId: any; }) => {
        const message = item.selectedAnswer === item.correctAnswer
          ? `Correct answer for question ${item.questionId}!`
          : `Incorrect answer for question ${item.questionId}. Correct answer was: ${item.correctAnswer}`;
    
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    }
  };

  const handleViewResults = () => {
    router.push(`/student/quizzes/results/${quizId}`);
  };

  return (
    <div className="quiz-attempt-container">
      <Toaster position="top-center" />
      <h1>Quiz</h1> 
      {questions.length > 0 ? (
        <form onSubmit={(e) => e.preventDefault()}>
          {questions.map((question) => {
            const questionFeedback = feedback[question._id];
            const selectedAnswer = answers.find((ans) => ans.questionId === question._id)?.answer;

            return (
              <div
                key={question._id}
                className={`question ${
                  isSubmitted &&
                  questionFeedback?.selectedAnswer !== questionFeedback?.correctAnswer
                    ? 'incorrect'
                    : ''
                } ${
                  isSubmitted &&
                  questionFeedback?.selectedAnswer === questionFeedback?.correctAnswer
                    ? 'correct'
                    : ''
                }`}
              >
                <h3>{question.question}</h3>
                {question.options.map((option) => {
                  const isCorrect = questionFeedback?.correctAnswer === option;
                  const isSelected = selectedAnswer === option;

                  return (
                    <label
                      key={option}
                      className={`answer-option ${isSelected ? 'selected-option' : ''} ${
                        isSubmitted && isCorrect ? 'correct-option' : ''
                      } ${
                        isSubmitted && !isCorrect && isSelected ? 'incorrect-option' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        onChange={() => handleAnswerChange(question._id, option)}
                        disabled={isSubmitted}
                        checked={isSelected}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
            );
          })}
          {!isSubmitted && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered()}
            >
              Submit Quiz
            </button>
          )}
        </form>
      ) : (
        <p>Loading questions...</p>
      )}

   
      {isSubmitted && (
        <button type="button" onClick={handleViewResults}>
          View Results
        </button>
      )}
    </div>
  );
};

export default QuizPage;
