"use client"
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import './Question.css';
import Cookies from 'js-cookie';

const InsertToQuestionBank: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { moduleId } = useParams();
  const [question, setQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<'TorF' | 'MCQ'>('TorF');
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [creating, setCreating] = useState(false);
  const [options, setOptions] = useState<string[]>(['True', 'False']);  // Default options for TorF
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const token = Cookies.get("authToken"); 

  if (!token) {
    console.error('No token found');
    return;
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) {
      console.error('Missing moduleId');
      alert('Module not found or invalid.');
      return;
    }

    if (!question || !correctAnswer || !options.every(opt => opt.trim())) {
      console.error('All fields must be filled');
      alert('Please fill all fields before submitting.');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        moduleId,
        question,
        options,
        correctAnswer,
        difficultyLevel,
        questionType,
      };

      const response = await axios.post('http://localhost:4000/instructor/quizzes/add', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        resetForm();
        onSuccess();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Error creating question:', axiosError.response?.data || axiosError.message);
        alert('Failed to create question.');
      } else {
        console.error('Unexpected error:', error);
        alert('Network error. Please try again later.');
      }
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (questionType === 'MCQ') {
      setOptions(['', '', '', '']); // Reset options when switching to MCQ
    } else {
      setOptions(['True', 'False']);  // Set options for True/False
    }
  }, [questionType]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const resetForm = () => {
    setQuestion('');
    setQuestionType('TorF');
    setDifficultyLevel('easy');
    setCorrectAnswer('');
    setOptions(['True', 'False']);
  };

  return (
    <form onSubmit={handleCreateQuestion} className="question-form">
      <h2>Create New Question</h2>

      <div>
        <label>Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a question"
          required
        />
      </div>

      <div>
        <label>Quiz Type:</label>
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as 'TorF' | 'MCQ')}
        >
          <option value="TorF">True or False</option>
          <option value="MCQ">Multiple Choice (4 Options)</option>
        </select>
      </div>

      {questionType === 'MCQ' && (
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

      {questionType === 'TorF' && (
        <div className="options">
          <label>Options:</label>
          <input
            type="text"
            value={options[0]}
            readOnly
          />
          <input
            type="text"
            value={options[1]}
            readOnly
          />
        </div>
      )}

      <div>
        <label>Correct Answer</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          placeholder="Enter the correct answer"
          required
        />
      </div>

      <div>
        <label>Difficulty Level:</label>
        <select
          value={difficultyLevel}
          onChange={(e) => setDifficultyLevel(e.target.value as 'easy' | 'medium' | 'hard')}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <button type="submit" disabled={creating}>
        {creating ? 'Creating...' : 'Create Question'}
      </button>
    </form>
  );
};

export default InsertToQuestionBank;
