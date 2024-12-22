"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const LessonDetailsPage = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const [lessonDetails, setLessonDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjMxYzQ5OGU1ZDZlZDA0OGI4YmEwZiIsImVtYWlsIjoiY2xhcmFAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzQ3OTA3NDAsImV4cCI6MTczNDg3NzE0MH0.MmxxWMIbbjlUBJfmvwMrUky3I7nj5NWLfyh0-Sw3DLE";

  useEffect(() => {
    const fetchLessonDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:4000/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch lesson details: ${response.statusText}`);
        }

        const data = await response.json();
        setLessonDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonDetails();
  }, [courseId, moduleId, lessonId]);

  if (loading) return <div>Loading lesson details...</div>;

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>Lesson Details</h1>
      <p>Title: {lessonDetails?.title}</p>
      <p>Content: {lessonDetails?.content}</p>
    </div>
  );
};

export default LessonDetailsPage;
