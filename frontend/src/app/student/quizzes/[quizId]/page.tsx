'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import './Quiz.css'

interface Question {
  _id: string;
  question: string;
  questionType: string;
  options: string[];
  correctAnswer?: string;
  difficultyLevel: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

const QuizPage = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [quizResponseId, setQuizResponseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log(token)
    if (!token) {
      console.error('Missing token');
      return;
    }
    const x=
    axios
  .post(
    `http://localhost:6089/student/quizzes/start/${quizId}`,
    {}, // No body here
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

      .then((response) => {
        setQuestions(response.data.questions);
        setQuizResponseId(response.data.response._id);
      })
      .catch((error) => {
        console.error('Error fetching quiz:', error);
      });
      console.log(x);
  }, [quizId]);


  

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prevAnswers) => {
      const updatedAnswers = prevAnswers.filter((item) => item.questionId !== questionId);
      return [...updatedAnswers, { questionId, answer }];
    });
  };

  const handleSubmit = async () => {
    if (!quizResponseId) {
      console.error('Missing quizResponseId');
      return;
    }

    try {
      const submittedAnswers = answers.map((answer) => ({
        questionId: answer.questionId,
        answer: answer.answer,
      }));

      const response = await axios.post(
        `http://localhost:6089/student/quizzes/submit/${quizId}`,
        { submittedAnswers: submittedAnswers },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        }
      );

    
      const { correctAnswers, feedback } = response.data;
      setFeedback(feedback); // `feedback` should map questionId -> true/false
      setIsSubmitted(true);

      alert(`Quiz Submitted! Your score is: ${response.data.score}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  return (
    <div className="quiz-container">
      <h1></h1>
      {questions.length > 0 ? (
        <form onSubmit={(e) => e.preventDefault()}>
          {questions.map((question) => (
            <div
              key={question._id}
              className={`question ${isSubmitted && feedback[question._id] === false ? 'incorrect' : ''} ${
                isSubmitted && feedback[question._id] === true ? 'correct' : ''
              }`}
            >
              <h3>{question.question}</h3>
              {question.options.map((option) => (
                <label key={option} className="answer-option">
                  <input
                    type="radio"
                    name={question._id}
                    value={option}
                    onChange={() => handleAnswerChange(question._id, option)}
                    disabled={isSubmitted} // Disable inputs after submission
                  />
                  {option}
                </label>
              ))}
            </div>
          ))}
          {!isSubmitted && (
            <button type="button" onClick={handleSubmit}>
              Submit Quiz
            </button>
          )}
        </form>
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

export default QuizPage;