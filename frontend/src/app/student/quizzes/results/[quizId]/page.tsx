
'use client'; 
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './Result.css';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface Feedback {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
}

interface QuizResponse {
  score: number;
  correctAnswers: number;
  feedback: Feedback[];
}

const QuizResults = () => {
  const { quizId } = useParams() 
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);
  const token = localStorage.getItem('authToken');


  useEffect(() => {
    const fetchResponse = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `http://localhost:6097/student/quizzes/user-response/${quizId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data?.quiz && response.data?.response) {
        
            setQuizResponse(response.data.response);
          } else {
            toast.error('Invalid response from the server.');
          }
        } catch (error) {
          toast.error('Failed to fetch results. Please try again.');
        }
      } else {
        toast.error('Missing authentication token.');
      }
    };

    if (quizId && token) fetchResponse();
  }, [quizId, token]);



  return (
    <div className="quiz-results-container">
      <Toaster position="top-center" />
      <h1>Quiz Results: {quizTitle}</h1>
      {quizResponse ? (
        <div className="results">
          <h2>Your Total Score: {quizResponse.score}</h2>
          <h3>Correct Answers Count: {quizResponse.correctAnswers}</h3>
      
        </div>
      ) : (
        <p>Loading results...</p>
      )}
    </div>
  );
};

export default QuizResults;
