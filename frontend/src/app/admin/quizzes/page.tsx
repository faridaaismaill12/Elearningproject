"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

import { LoadingSpinner } from "../../_components/LoadingSpinner";
import { Types } from "mongoose";
import './Quizzes.css'
import Cookies from "js-cookie";

interface Quiz {
  _id: string
  moduleId: Types.ObjectId;
  name: string;
  numberOfQuestions: number;
  quizType: string;
  difficultyLevel: string;
  duration: number;
}

const Quizzes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get("authToken");

  useEffect(() => {
    if (token) {
      fetchQuizzes();
    } else {
      console.error("Token is missing.");
    }
  }, [token]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:6080/admin/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setError("Failed to fetch quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (!token) return;
  
    try {
      await axios.delete(`http://localhost:6080/admin/quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz._id !== quizId));
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      setError("Failed to delete quiz. Please try again.");
    }
  };
  
  

  if (loading) return <LoadingSpinner />;

  return (
    <div className="admin_quiz_container">
      <h2>Quiz List</h2>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Quiz Name</th>
              <th>Number of Questions</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Duration (mins)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz, index) => (
              <tr key={quiz._id.toString()}>
                <td>{index + 1}</td>
                <td>{quiz.name}</td>
                <td>{quiz.numberOfQuestions}</td>
                <td>{quiz.quizType}</td>
                <td>{quiz.difficultyLevel}</td>
                <td>{quiz.duration}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(quiz._id.toString())}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Quizzes;
