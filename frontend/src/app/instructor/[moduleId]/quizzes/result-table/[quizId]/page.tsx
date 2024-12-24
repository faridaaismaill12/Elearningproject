"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { LoadingSpinner } from "../../../../../_components/LoadingSpinner";
import "./QuizResultTable.css";
import { useParams } from "next/navigation";

interface QuizResponse {
  _id: string;
  user: string;
  quiz: string;
  questionsIds: string[];
  answers: Array<{ questionId: string; answer: string }>;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  startTime: string | null;
}

interface QuizDetails {
  name: string;
  duration: number;
  difficultyLevel: string;
  quizType: string;
}

const QuizResponses: React.FC = () => {
  const { quizId } = useParams()
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    if (!token || !quizId) {
      setError("Authorization token or quiz ID is missing.");
      return;
    }
    fetchResponses();
  }, [token, quizId]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:6085/instructor/quiz-responses/${quizId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const { quiz, responses } = response.data;
      setQuizDetails(quiz);
      setResponses(responses);
    } catch (err: any) {
      console.error("Error fetching responses:", err.response || err.message);
      setError("Failed to fetch responses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="quiz-responses-container">
      <h2>Quiz Responses</h2>
      {error && !loading && !responses.length && <p className="error-message">{error}</p>}

      {quizDetails && (
        <div className="quiz-details">
          <h3>Quiz Details</h3>
          <p>
            <strong>Name:</strong> {quizDetails.name}
          </p>
          <p>
            <strong>Type:</strong> {quizDetails.quizType}
          </p>
          <p>
            <strong>Difficulty:</strong> {quizDetails.difficultyLevel}
          </p>
          <p>
            <strong>Duration:</strong> {quizDetails.duration} mins
          </p>
        </div>
      )}

      {responses.length > 0 ? (
        <table className="quiz-response-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Score</th>
              <th>Correct Answers</th>
              <th>Total Answered</th>
              <th>Start Time</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((response, index) => (
              <tr key={response._id}>
                <td>{index + 1}</td>
                <td>{response.user}</td>
                <td>{response.score}</td>
                <td>{response.correctAnswers}</td>
                <td>{response.totalAnswered}</td>
                <td>
                  {response.startTime
                    ? new Date(response.startTime).toLocaleString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No responses found for this quiz.</p>
      )}
    </div>
  );
};

export default QuizResponses;
