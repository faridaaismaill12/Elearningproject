'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import Image from 'next/image';

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
  totalAnswered: number;
}

const QuizResults = () => {
  const { quizId } = useParams();
  const [quizTitle, setQuizTitle] = useState<string>('Loading...');
  const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast.error('Missing authentication token.');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:6080/student/quizzes/user-response/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.quiz) {
          setQuizTitle(response.data.quiz.name || 'Untitled Quiz');
          setQuizResponse({
            score: response.data.score || 0,
            correctAnswers: response.data.correctAnswers || 0,
            totalAnswered: response.data.totalAnswered || 0,
          });
        } else {
          toast.error('Invalid response from the server.');
        }
      } catch (error) {
        toast.error('Failed to fetch results. Please try again.');
      }
    };

    if (quizId) {
      fetchResponse();
    }
  }, [quizId]);

  return (
    <div className="quiz-results-container">
      <Toaster position="top-center" />
      <h1>Quiz Results: {quizTitle}</h1>
      <div className="left-side">
        <Image
          src="/undraw_online-test_20lm.svg" 
          alt="Learning Sketching"
          width={300}
          height={300}
          className="banner-svg"
        />
      </div>

      {quizResponse ? (
        <div className="results">
          <h2>Your Total Score: {quizResponse.score}</h2>
          <h3>Correct Answers Count: {quizResponse.correctAnswers}</h3>
          <h3>Total Questions: {quizResponse.totalAnswered}</h3>
          <div className='result-text'>
          {quizResponse.score > 70 ? (
            <h3>Excellent work! You nailed it!</h3> 
          ) : (
            <h3>You're making progress! Keep going, and you'll get it next time</h3>
          )}
        </div>
        </div>
      ) : (
        <p>Loading results...</p>
      )}

      <div className="right-side">
        <Image
          src="/Innovation-amico.svg" 
          alt="Learning Sketching"
          width={300}
          height={300}
          className="banner-svg"
        />
      </div>
    </div>
  );
};

export default QuizResults;
