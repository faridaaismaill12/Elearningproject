"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiDownload } from "react-icons/fi";

const ModuleDetailsPage = () => {
  const { courseId, moduleId } = useParams();
  const router = useRouter();
  const [moduleDetails, setModuleDetails] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]); // To store quizzes
  const [files, setFiles] = useState<string[]>([]); // Store file paths
  const [videos, setVideos] = useState<string[]>([]); // Store video paths
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Retrieve token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login");
    }
  }, []);

  // Fetch module details, lessons, files, and videos
  useEffect(() => {
    const fetchModuleDetails = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch module details
        const moduleResponse = await fetch(
          `http://localhost:4000/courses/${courseId}/modules/${moduleId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!moduleResponse.ok) {
          throw new Error(
            `Failed to fetch module details: ${moduleResponse.statusText}`
          );
        }

        const moduleData = await moduleResponse.json();
        setModuleDetails(moduleData);
        setFiles(moduleData.files || []); // Files in the module
        setVideos(moduleData.videos || []); // Videos in the module

        // Fetch lessons
        // Fetch lessons for the module
        const lessonsResponse = await fetch(
          `http://localhost:4000/courses/${courseId}/modules/${moduleId}/lessons`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!lessonsResponse.ok) {
          throw new Error(
            `Failed to fetch lessons: ${lessonsResponse.statusText}`
          );
        }

        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);

        // Fetch quizzes
        const quizzesResponse = await fetch(
          `http://localhost:4000/student/quizzes/all/${moduleId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!quizzesResponse.ok) {
          throw new Error(
            `Failed to fetch quizzes: ${quizzesResponse.statusText}`
          );
        }

        const quizzesData = await quizzesResponse.json();
        setQuizzes(quizzesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && moduleId) {
      fetchModuleDetails();
    } else {
      setError("Course ID or Module ID is missing.");
    }
  }, [courseId, moduleId, token]);

  // Navigate to lesson details
  const handleLessonClick = (lessonId: string) => {
    router.push(`/course/studentDetails/${courseId}/${moduleId}/${lessonId}`);
  };

  const handleStartQuiz = async (quizId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:4000/student/quizzes/start/${quizId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to start quiz: ${response.statusText}`);
      }

      const quizData = await response.json();
      alert("Quiz started successfully!");

      // Redirect to the quiz page
      router.push(`/student/quizzes/${quizId}`);
    } catch (err: any) {
      alert(`Error starting quiz: ${err.message}`);
    }
  };

  const handleDownloadFiles = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}/files`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download files: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `module_${moduleId}_files.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading module details...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>Module Details</h1>
      <p>
        <strong>Title:</strong> {moduleDetails?.title || "N/A"}
      </p>
      <p>
        <strong>Content:</strong> {moduleDetails?.content || "N/A"}
      </p>

      <button
        onClick={handleDownloadFiles}
        style={{
          padding: "0.5rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        <FiDownload /> Download Files
      </button>

      <h2>Lessons</h2>
      {lessons.length > 0 ? (
        <ul>
          {lessons.map((lesson) => (
            <li
              key={lesson._id}
              style={{
                cursor: "pointer",
                color: "#007bff",
                textDecoration: "underline",
                marginBottom: "0.5rem",
              }}
              onClick={() => handleLessonClick(lesson._id)}
            >
              {lesson.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons available for this module.</p>
      )}

      <h2>Quizzes</h2>
      {quizzes.length > 0 ? (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz._id} style={{ marginBottom: "1rem" }}>
              <p>
                <strong>Name:</strong> {quiz.name}
              </p>
              <p>
                <strong>Number of Questions:</strong> {quiz.numberOfQuestions}
              </p>
              <p>
                <strong>Type:</strong> {quiz.quizType}
              </p>
              <p>
                <strong>Duration:</strong> {quiz.duration} minutes
              </p>
              <button
                onClick={() => handleStartQuiz(quiz._id)}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Start Quiz
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files available for this module.</p>
      )}

      <h2>Videos</h2>
      {videos.length > 0 ? (
        videos.map((videoUrl, index) => (
          <div key={index} style={{ marginBottom: "1rem" }}>
            <video
              controls
              style={{
                width: "100%",
                maxHeight: "400px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <source src={`http://localhost:4000/uploads/${videoUrl}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))
      ) : (
        <p>No videos available for this module.</p>
      )}
    </div>
  );
};

export default ModuleDetailsPage;
