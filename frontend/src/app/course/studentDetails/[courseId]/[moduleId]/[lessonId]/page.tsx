"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const LessonDetailsPage = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const [lessonDetails, setLessonDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

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
    const fetchLessonDetails = async () => {
      if (!token) return;

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

    if (courseId && moduleId && lessonId) {
      fetchLessonDetails();
    } else {
      setError("Course ID, Module ID, or Lesson ID is missing.");
    }
  }, [courseId, moduleId, lessonId, token]);

  if (loading) return <div>Loading lesson details...</div>;

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Lesson Details</h1>
      <p>
        <strong>Title:</strong> {lessonDetails?.title || "N/A"}
      </p>
      <p>
        <strong>Content:</strong> {lessonDetails?.content || "N/A"}
      </p>
    </div>
  );
};

export default LessonDetailsPage;
