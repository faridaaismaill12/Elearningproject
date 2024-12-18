"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import './QuestionTable.css';
import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/app/_components/LoadingSpinner";
interface Question {
  _id: string;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  difficultyLevel: string;
}

const QuestionsTable: React.FC = () => {
  const { moduleId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [questionType, setQuestionType] = useState<'TorF' | 'MCQ'>('TorF');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [creating, setCreating] = useState(false);
  const [options, setOptions] = useState<string[]>(['True', 'False']);  // Default options for TorF
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [formData, setFormData] = useState({
    question: "",
    questionType: "MCQ",
    options: "",
    correctAnswer: "",
    difficultyLevel: "easy",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (moduleId && token) {
      fetchQuestions();
    } else {
      console.error("Module ID or token is missing.");
    }
  }, [moduleId, token]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:6008/instructor/quizzes/module/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await axios.delete(`http://localhost:6008/instructor/quizzes/delete/question/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const openAddDialog = () => {
    setFormData({
      question: "",
      questionType: "MCQ", // Default to MCQ
      options: "",
      correctAnswer: "",
      difficultyLevel: "easy", // Default to easy
    });
    setOptions(['', '', '', '']); // Reset options to 4 empty fields for MCQ
    setIsAddDialogOpen(true);
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

      await axios.patch(`http://localhost:6008/instructor/quizzes/update/question/${currentQuestion._id}`, updatedQuestion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
      setIsUpdateDialogOpen(false);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newQuestion = {
        ...formData,
        options: formData.options.split(",").map((option) => option.trim()),
      };

      await axios.post(`http://localhost:6008/instructor/quizzes/add`, newQuestion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      resetForm();
      fetchQuestions();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: "",
      questionType: "MCQ",
      options: "",
      correctAnswer: "",
      difficultyLevel: "easy",
    });
    setOptions(['', '', '', '']);
  };

  useEffect(() => {
    if (formData.questionType === 'MCQ') {
      setOptions(['', '', '', '']); // Reset options when switching to MCQ
    } else {
      setOptions(['True', 'False']); // Set options for True/False
    }
  }, [formData.questionType]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };


  //if(loading) return <LoadingSpinner/>

  return (
    <div className="container">
      <h2>Question Bank</h2>
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
              <th>Actions</th>
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
                  <button className="btn btn-add" onClick={openAddDialog}>
              <FaPlus />
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
                <label>Question Type:</label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TorF">True or False</option>
                </select>
              </div>

              {formData.questionType === "MCQ" && (
                <div className="options">
                  <label>Enter 4 Options:</label>
                  {options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  ))}
                </div>
              )}

              {formData.questionType === "TorF" && (
                <div>
                  <label>Options:</label>
                  <input
                    type="text"
                    value="True"
                    readOnly
                  />
                  <input
                    type="text"
                    value="False"
                    readOnly
                  />
                </div>
              )}

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

              <button type="submit">Update Question</button>
              <button
                type="button"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Cancel
              </button>
            
            </form>
          </div>
        </div>
      )}

      {/* Add Dialog */}
      {isAddDialogOpen && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <h3>Add New Question</h3>
            <form onSubmit={handleAdd}>
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
                <label>Question Type:</label>
                <select
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TorF">True or False</option>
                </select>
              </div>

              {formData.questionType === "MCQ" && (
                <div className="options">
                  <label>Enter 4 Options:</label>
                  {options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  ))}
                </div>
              )}

              {formData.questionType === "TorF" && (
                <div>
                  <label>Options:</label>
                  <input
                    type="text"
                    value="True"
                    readOnly
                  />
                  <input
                    type="text"
                    value="False"
                    readOnly
                  />
                </div>
              )}

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

              <button className="btn" type="submit">Create Question</button>
              <button
                type="button"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

   
    </div>
  );
};

export default QuestionsTable;
