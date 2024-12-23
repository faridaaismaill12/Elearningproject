import React from 'react';
import './Quiz.css';

interface DeleteQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  quizName: string;
}

const DeleteQuizModal: React.FC<DeleteQuizModalProps> = ({ isOpen, onClose, onConfirm, quizName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Quiz</h2>
        <p className="modal-message">
          Are you sure you want to delete the quiz "{quizName}"? This action cannot be undone.
        </p>
        <div className="button-group">
          <button onClick={onClose} className="button button-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="button button-danger">
            Delete Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteQuizModal;