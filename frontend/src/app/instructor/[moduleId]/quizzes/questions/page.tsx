"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import './QuestionTable.css'
import { useParams } from "next/navigation";

interface Question {
  _id: string;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  difficultyLevel: string;
}

const QuestionsTable: React.FC<{ moduleId: string }> = () => {
  const {moduleId} = useParams()
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    questionType: "",
    options: "",
    correctAnswer: "",
    difficultyLevel: "",
  });

  const token = localStorage.getItem("authToken");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5616/instructor/quizzes/modules/${moduleId}`,{
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
      if (token) fetchQuestions();
      else console.error("No token found");
    }, [moduleId, token]);



  useEffect(() => {
    fetchQuestions();
  }, [moduleId]);

  // Delete question
  const handleDelete = async (questionId: string) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await axios.delete(`http://localhost:5616/instructor/quizzes/delete/question/${questionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setQuestions((prev) => prev.filter((q) => q._id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const openUpdateDialog = (question: Question) => {
    setCurrentQuestion(question);
    setFormData({
      question: question.question,
      questionType: question.questionType,
      options: question.options.join(", "),
      correctAnswer: question.correctAnswer,
      difficultyLevel: question.difficultyLevel,
    });
    setIsUpdateDialogOpen(true);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion) return;

    try {
      const updatedQuestion = {
        ...formData,
        options: formData.options.split(",").map((option) => option.trim()),
      };

      await axios.patch(`http://localhost:5616/instructor/quizzes/update/question/${currentQuestion._id}`, updatedQuestion,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchQuestions(); 
      setIsUpdateDialogOpen(false); 
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  return (
    <div className="container">
      <h2>Questions in Module</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Type</th>
              <th>Options</th>
              <th>Correct Answer</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question._id}>
                <td>{index + 1}</td>
                <td>{question.question}</td>
                <td>{question.questionType}</td>
                <td>{question.options.join(", ")}</td>
                <td>{question.correctAnswer}</td>
                <td>{question.difficultyLevel}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => openUpdateDialog(question)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(question._id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Update Dialog */}
      {isUpdateDialogOpen && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Update Question</h3>
            <form onSubmit={handleUpdate}>
              <div>
                <label>Question:</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Type:</label>
                <input
                  type="text"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Options (comma-separated):</label>
                <input
                  type="text"
                  name="options"
                  value={formData.options}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Correct Answer:</label>
                <input
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Difficulty:</label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <button type="submit" className="btn btn-primary">Update</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsUpdateDialogOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsTable;

