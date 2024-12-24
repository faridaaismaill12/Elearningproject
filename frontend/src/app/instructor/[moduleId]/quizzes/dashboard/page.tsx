'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ModuleQuizzes.css';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { FaTrash, FaEdit } from 'react-icons/fa';
import { MdQuiz } from 'react-icons/md';
import { Types } from 'mongoose';
import Cookies from 'js-cookie';

interface Quiz {
  _id: any;
  moduleId: Types.ObjectId;
  name: string;
  numberOfQuestions: number;
  quizType: string;
  difficultyLevel: string;
  duration: number;
}

const ModuleQuizzes: React.FC = () => {
  const { moduleId } = useParams(); // Get moduleId from the URL
  const router = useRouter(); // Initialize Next.js router
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: 10,
    numberOfQuestions: 10,
    difficultyLevel: 'easy',
    quizType: 'easy',
  });

  const token = Cookies.get("authToken");

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
        `http://localhost:4000/instructor/quizzes/all/${moduleId}`,
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
        `http://localhost:4000/instructor/quizzes/delete/${moduleId}/${quizId}`,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const updateQuiz = async (quizId: string) => {
    if (!currentQuiz) return;

    try {
      const updatedQuiz = {
        ...formData,
      };

      await axios.patch(
        `http://localhost:4000/instructor/quizzes/update/${quizId}`,
        updatedQuiz,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchQuizzes();
      setIsUpdateDialogOpen(false); 
    } catch (error) {
      console.error('Error updating quiz:', error);
      setError('Failed to update quiz. Please try again.');
    }
  };

  const navigateToCreateQuiz = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/create`);
    }
  };

  const openUpdateDialog = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setFormData({
      name: quiz.name,
      duration: quiz.duration,
      numberOfQuestions: quiz.numberOfQuestions,
      difficultyLevel: quiz.difficultyLevel,
      quizType: quiz.quizType,
    });
    setIsUpdateDialogOpen(true);
  };

  const navigateToCreateQuestion = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/questions/create`);
    }
  };

  const navigateToViewQuestion = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/questions`);
    }
  };

  const navigateToResultsTable = () => {
    if (moduleId) {
      router.push(`/instructor/${moduleId}/quizzes/result-table`);
    }
  };


  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from refreshing
    if (currentQuiz) {
      updateQuiz(currentQuiz._id);
    }
  };

  return (
    <div>
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
          <p>Track student performance across quizzes and assess trends to improve learning outcomes.</p>
          <button type="button" onClick={navigateToCreateQuestion}>
          Go to Create Question
          </button>
        </div>
        <div className="box_left">
          <h3>View Scores</h3>
          <p>Track student performance across quizzes and assess trends to improve learning outcomes.</p>
          <button type="button" onClick={navigateToViewQuestion}>
            View Question Bank
          </button>
        </div>
        <div className="box_left">
          <h3>View Student Results</h3>
          <p>View and Evalutate student quiz performance</p>
          <button type="button" onClick={navigateToResultsTable}>
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
            {quizzes.map((quiz) => {
              const quizId = quiz._id;
              return (
                <div key={quizId} className="quiz-card">
                  <h3>{quiz.name || 'Unnamed Quiz'}</h3>
                  <p>Type: {quiz.quizType || 'N/A'}</p>
                  <p>Duration: {quiz.duration || 0} minutes</p>
                  <p>Questions: {quiz.numberOfQuestions || 0}</p>
                  <p>Difficulty: {quiz.difficultyLevel }</p>

                  <div className="quiz-actions">
                    <FaEdit
                      className="action-icon edit-icon"
                      title="Edit Quiz"
                      onClick={() => openUpdateDialog(quiz)}
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
        {isUpdateDialogOpen && currentQuiz && (
          <div className="update-dialog">
            <div className="dialog-content">
              <h3>Update Quiz</h3>
              <form onSubmit={handleFormSubmit}>
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Duration:
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Number of Questions:
                  <input
                    type="number"
                    name="numberOfQuestions"
                    value={formData.numberOfQuestions}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Difficulty Level:
                  <select
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <button className='update'type="submit">Update</button>
                <button type="button" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleQuizzes;
