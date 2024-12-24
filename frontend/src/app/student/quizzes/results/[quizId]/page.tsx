'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Result.css';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface QuizResponse {
  score: number;
  correctAnswers: number;
  totalAnswered: number;
}

const QuizResults = () => {
  const { quizId } = useParams() as { quizId: string };
  const [name, setQuizName] = useState<string>('Loading...');
  const [quizResponse, setQuizResponse] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        toast.error('Missing authentication token.');
        setError('Authentication token is required to fetch quiz results.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:6190/student/quizzes/user-response/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.quiz) {
          setQuizName(response.data.quiz.name || 'Untitled Quiz');
          setQuizResponse({
            score: response.data.score || 0,
            correctAnswers: response.data.correctAnswers || 0,
            totalAnswered: response.data.totalAnswered || 0,
          });
        } else {
          toast.error('Invalid response from the server.');
          setError('The server returned an invalid response.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch results. Please check your network and try again.');
        toast.error('Failed to fetch results.');
      } finally {
        setLoading(false);
      }
    };

    if (quizId) {
      fetchResponse();
    } else {
      setError('Quiz ID is missing.');
      setLoading(false);
    }
  }, [quizId]);

  const renderResultsMessage = () => {
    if (quizResponse) {
      if (quizResponse.score > 90) {
        return <h3>Outstanding performance! You're a quiz master!</h3>;
      } else if (quizResponse.score > 70) {
        return <h3>Excellent work! You nailed it!</h3>;
      } else if (quizResponse.score > 50) {
        return <h3>Good effort! Keep practicing, and you'll improve even more!</h3>;
      }else {
        return <h3>You need to review the module again!</h3>;
      }
    }
    return null;
  };

  return (
    <div className="quiz-results-container">
      <Toaster position="top-center" />
      <h1>Quiz Results: {name}</h1>

      <div className="left-side">
        <Image
          src="/undraw_learning_sketching_nd4f.svg"
          alt="Learning Sketching"
          width={300}
          height={300}
          className="banner-svg"
        />
      </div>

      {loading ? (
        <p>Loading results...</p>
      ) : error ? (
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : quizResponse ? (
        <div className="results">
          <h2>Your Total Score: {quizResponse.score}</h2>
          <h3>Correct Answers Count: {quizResponse.correctAnswers}</h3>
          <h3>Total Questions: {quizResponse.totalAnswered}</h3>
          <div className="result-text">{renderResultsMessage()}</div>
        </div>
      ) : (
        <p>No results found. Please check if the quiz exists or try again later.</p>
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

