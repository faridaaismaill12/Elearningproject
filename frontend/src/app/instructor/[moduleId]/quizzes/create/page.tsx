'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Quiz.css';
import { useParams } from 'next/navigation';


const QuizForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { moduleId } = useParams(); 
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(1);
  const [duration, setDuration] = useState<number>(10);
  const [quizType, setQuizType] = useState<'TorF' | 'MCQ' | 'Both'>('TorF');
  const [creating, setCreating] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false); 
  
  const token = localStorage.getItem('authToken'); 
  if (!token) {
    console.error('No token found');
    return;
  }

  const fetchQuizzes = async () => {
    if (!moduleId || !userId) return; // Ensure both moduleId and userId are available

    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:6269/instructor/quizzes/all/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}` // Pass the token to the backend
        }
      });
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) {
      console.error('Missing moduleId or userId');
    
    }

    setCreating(true);
    try {
      const payload = {
        name,
        duration,
        numberOfQuestions,
        quizType,
        moduleId,
      };

      await axios.post('http://localhost:6280/instructor/quizzes/create', payload, {
        headers: {
          Authorization: `Bearer ${token}` // Pass the token to the backend
        }
      });
      resetForm();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Error creating quiz. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDuration(10);
    setNumberOfQuestions(1);
    setQuizType('TorF');
  };

  return (
    <form onSubmit={handleCreateQuiz} className="quiz-form">
      <h2>Create New Quiz</h2>

      <div>
        <label>Quiz Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter quiz name"
          required
        />
      </div>

      <div>
        <label>Duration (minutes):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={1}
          required
        />
      </div>

      <div>
        <label>Number of questions:</label>
        <input
          type="number"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
          min={1}
          required
        />
      </div>

      <div>
        <label>Quiz Type:</label>
        <select
          value={quizType}
          onChange={(e) => setQuizType(e.target.value as 'TorF' | 'MCQ')}
        >
          <option value="TorF">True or False</option>
          <option value="MCQ">Multiple Choice</option>
          <option value="Both">Multiple Choice & True or False</option>
        </select>
      </div>
      <button type="submit" disabled={creating}>
        {creating ? 'Creating...' : 'Create Quiz'}
        
      </button>
    </form>
  );
};

export default QuizForm;
