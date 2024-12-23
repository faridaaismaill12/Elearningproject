"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiDownload } from "react-icons/fi"; // Importing a download icon

const ModuleDetailsPage = () => {
  const { courseId, moduleId } = useParams(); // Capture dynamic route params
  const router = useRouter();
  const [moduleDetails, setModuleDetails] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Retrieve token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken"); // Replace 'authToken' with your token's key
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login"); // Redirect to login if token is not found
    }
  }, []);

  useEffect(() => {
    const fetchModuleDetails = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch module details
        const moduleResponse = await fetch(`http://localhost:4000/courses/${courseId}/modules/${moduleId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!moduleResponse.ok) {
          throw new Error(`Failed to fetch module details: ${moduleResponse.statusText}`);
        }

        const moduleData = await moduleResponse.json();
        setModuleDetails(moduleData);

        // Fetch lessons for the module
        const lessonsResponse = await fetch(`http://localhost:4000/courses/${courseId}/modules/${moduleId}/lessons`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!lessonsResponse.ok) {
          throw new Error(`Failed to fetch lessons: ${lessonsResponse.statusText}`);
        }

        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);
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

  const handleLessonClick = (lessonId: string) => {
    console.log(`Navigating to lessonId: ${lessonId}`); // Debugging
    router.push(`/course/studentDetails/${courseId}/${moduleId}/${lessonId}`);
  };

  const handleDownloadFiles = async () => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/courses/${courseId}/modules/${moduleId}/files`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
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
    </div>
  );
};

export default ModuleDetailsPage;
