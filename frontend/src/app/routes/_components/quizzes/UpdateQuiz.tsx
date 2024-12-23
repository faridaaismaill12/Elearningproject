import React, { useState } from 'react';
import './Quiz.css';

interface UpdateQuizModalProps {
  quiz: {
    name: string;
    duration: number;
    numberOfQuestions: number;
    quizType: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedQuiz: any) => void;
}

const UpdateQuizModal: React.FC<UpdateQuizModalProps> = ({ quiz, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: quiz.name,
    duration: quiz.duration,
    numberOfQuestions: quiz.numberOfQuestions,
    quizType: quiz.quizType,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'numberOfQuestions' ? parseInt(value) : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Update Quiz</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Quiz Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Number of Questions</label>
            <input
              type="number"
              name="numberOfQuestions"
              value={formData.numberOfQuestions}
              onChange={handleChange}
              min="1"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quiz Type</label>
            <select
              name="quizType"
              value={formData.quizType}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="practice">Practice</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="button button-cancel">
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              Update Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateQuizModal;