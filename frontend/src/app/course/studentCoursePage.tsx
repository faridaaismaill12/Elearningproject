"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const StudentCoursePage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjMxYzQ5OGU1ZDZlZDA0OGI4YmEwZiIsImVtYWlsIjoiY2xhcmFAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzQ3OTA3NDAsImV4cCI6MTczNDg3NzE0MH0.MmxxWMIbbjlUBJfmvwMrUky3I7nj5NWLfyh0-Sw3DLE"; // Replace with the actual token

  useEffect(() => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT
      const userEmail = decodedToken.email; // Extract email from the token
      setEmail(userEmail);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }, []);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:4000/users/my-enrolled-courses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch enrolled courses: ${response.statusText}`);
        }

        const data = await response.json();
        setEnrolledCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const handleCourseClick = (courseId: string | undefined) => {
    if (!courseId) {
      console.error("Invalid courseId:", courseId); // Debug undefined courseId
      return;
    }
    console.log("Navigating to:", `/studentDetails/${courseId}`); // Log route
    router.push(`/course/studentDetails/${courseId}`);
  };
  
  
  

  if (loading) return <div>Loading enrolled courses...</div>;

  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Student Information</h1>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          marginBottom: "1rem",
        }}
      >
        <p>
          <strong>Email:</strong> {email}
        </p>
      </div>

      {enrolledCourses.length > 0 ? (
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
          }}
        >
          <h2>Enrolled Courses</h2>
          <ul>
            {enrolledCourses.map((course: any) => (
              <li
                key={course._id}
                style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                onClick={() => handleCourseClick(course._id)}
              >
                {course.title}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No enrolled courses found.</p>
      )}
    </div>
  );
};

export default StudentCoursePage;
