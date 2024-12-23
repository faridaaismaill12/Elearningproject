import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import './QuizCard.css';

interface QuizCardProps {
  quiz: {
    _id: string;
    name: string;
    quizType: string;
    duration: number;
    numberOfQuestions: number;
  };
  onUpdate: (quizId: string) => void;
  onDelete: (quizId: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onUpdate, onDelete }) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.quiz-actions')) {
      return;
    }
    router.push(`/quiz/${quiz._id}`);
  };

  return (
    <div className="quiz-card" onClick={handleCardClick}>
      <h3 className="quiz-title">{quiz.name}</h3>
      <p className="quiz-info">Type: {quiz.quizType}</p>
      <p className="quiz-info">Duration: {quiz.duration} minutes</p>
      <p className="quiz-info">Questions: {quiz.numberOfQuestions}</p>

      <div className="quiz-actions" onClick={e => e.stopPropagation()}>
        <FaEdit className="action-icon edit-icon" onClick={() => onUpdate(quiz._id)} />
        <FaTrash className="action-icon delete-icon" onClick={() => onDelete(quiz._id)} />
      </div>
    </div>
  );
};

export default QuizCard;