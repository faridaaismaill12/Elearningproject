'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ModuleQuizzes.css';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { FaTrash, FaEdit } from 'react-icons/fa';
import { MdQuiz } from "react-icons/md";

const ModuleQuizzes: React.FC = () => {
  const { moduleId } = useParams(); // Get moduleId from the URL
  const router = useRouter(); // Initialize Next.js router
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    if (moduleId) {
      fetchQuizzes();
    }
  }, [moduleId]);

  const fetchQuizzes = async () => {
    if (!token || !moduleId) {
      setError('Missing token or moduleId');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5608/instructor/quizzes/all/${moduleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (Array.isArray(data)) {
        setQuizzes(data);
      } else {
        setError('Invalid data format from server.');
      }
    } catch (error) {
      setError('Failed to fetch quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!token) return;

    try {
      await axios.delete(
        `http://localhost:5608/instructor/quizzes/delete/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setQuizzes((prevQuizzes) =>
        prevQuizzes.filter((quiz) => quiz._id !== quizId)
      );
    } catch (error) {
      setError('Failed to delete quiz. Please try again.');
    }
  };

  const updateQuiz = (quizId: string) => {
    console.log('Updating quiz with ID:', quizId);
  };

  const navigateToCreateQuiz = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/create`);
    }
  };

  const navigateToCreateQuestion = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/questions/create`);
    }
  };

  return (
    <div >
      <div className="dashboard_container">
      
        <div className="box_right">
          <h3>Create Quiz</h3>
          <p>Design and set up new quizzes for your module. Define the quiz type, duration, and other details to engage your students.</p>
          <button type="button" onClick={navigateToCreateQuiz}>
            Go to Create Quiz
          </button>
        </div>
        <div className="box_right">
          <h3>View Questions</h3>
          <p>Manage the questions in your module’s question bank. View questions to ensure your assessments are comprehensive and balanced for your students.</p>
          <button type="button" onClick={navigateToCreateQuiz}>
            Go to Create Quiz
          </button>
        </div>
        <div className="box_left">
          <h3>View Scores</h3>
          <p>Track student performance across quizzes and assess trends to improve learning outcomes.</p>
          <button type="button" onClick={navigateToCreateQuestion}>
            Go to Create Question
          </button>
        </div>
        <div className="box_left">
          <h3>Create Question</h3>
          <p>Add questions to the module's question bank. Customize question types, difficulty levels for effective assessments.</p>
          <button type="button" onClick={navigateToCreateQuestion}>
            Go to Create Question
          </button>
        </div>
      </div>
      <div className="module-quizzes-container">
        <h2>Available Quizzes</h2>

        {error && <p className="error-message">{error}</p>}

        {loading ? (
          <p>Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <p>No quizzes found for this module.</p>
        ) : (
          <div className="quiz-cards-container">
            {quizzes.map((quiz, index) => {
              const quizId = quiz._id;
              return (
                <div key={quizId} className="quiz-card">
                  <h3>{quiz.name || 'Unnamed Quiz'}</h3>
                  <p>Type: {quiz.quizType || 'N/A'}</p>
                  <p>Duration: {quiz.duration || 0} minutes</p>
                  <p>Questions: {quiz.numberOfQuestions || 0}</p>

                  <div className="quiz-actions">
                    <FaEdit
                      className="action-icon edit-icon"
                      title="Edit Quiz"
                      onClick={() => updateQuiz(quizId)}
                    />
                    <FaTrash
                      className="action-icon delete-icon"
                      title="Delete Quiz"
                      onClick={() => deleteQuiz(quizId)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleQuizzes;
