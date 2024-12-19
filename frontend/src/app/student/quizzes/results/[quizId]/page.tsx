'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface Question {
  _id: string;
  question: string;
}

interface Answer {
  questionId: Question;
  answer: string;
}

interface QuizResponse {
  score: number;
  correctAnswers: number;
  answers: Answer[];
}

const QuizResults = () => {
  const { quizId } = useParams();
  const [quizTitle, setQuizTitle] = useState<string>('Loading...');
  const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we access localStorage only in the browser
    if (typeof window !== 'undefined') {
      const authToken = localStorage.getItem('authToken');
      setToken(authToken);
    }
  }, []);

  useEffect(() => {
    const fetchResponse = async () => {
      if (!token) {
        toast.error('Missing authentication token.');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/student/quizzes/user-response/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('API Response:', response.data);

        if (response.data?.quiz ) {
          setQuizTitle(response.data.quiz.name || 'Untitled Quiz');
          setQuizResponse({
            score: response.data.score,
            correctAnswers: response.data.correctAnswers,
            answers: response.data.answers.map((ans: any) => ({
              questionId: {
                _id: ans.questionId._id,
                question: ans.questionId.question,
              },
              answer: ans.answer,
            })),
          });
        } else {
          toast.error('Invalid response from the server.');
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
        toast.error('Failed to fetch results. Please try again.');
      }
    };

    if (quizId && token) {
      fetchResponse();
    }
  }, [quizId, token]);

  return (
    <div className="quiz-results-container">
      <Toaster position="top-center" />
      <h1>Quiz Results: {quizTitle}</h1>
      {quizResponse ? (
        <div className="results">
          <h2>Your Total Score: {quizResponse.score}</h2>
          <h3>Correct Answers Count: {quizResponse.correctAnswers}</h3>
          <div className="feedback">
            {quizResponse.answers.map((item) => (
              <div key={item.questionId._id} className="feedback-item">
                <p>
                  <strong>Question:</strong> {item.questionId.question}
                </p>
                <p>
                  <strong>Your Answer:</strong> {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
};

export default QuizResults;
