"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const StudentCoursePage = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("authToken"); // Replace 'authToken' with your token's key
    if (token) {
      setToken(token);

      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode the JWT
        const userEmail = decodedToken.email; // Extract email from the token
        setEmail(userEmail);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("No token found in localStorage");
      setError("Authentication token not found. Please log in.");
    }
  }, []);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!token) return;

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
  }, [token]);

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
          <strong>Email:</strong> {email || "Email not available"}
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
            {enrolledCourses.map((course: any, index: number) => {
              const courseId = course._id || course.courseId; // Adjust to your backend schema
              return (
                <li
                  key={courseId || `fallback-key-${index}`}
                  style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                  onClick={() => handleCourseClick(courseId)}
                >
                  {course.title || "Untitled Course"}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No enrolled courses found.</p>
      )}
    </div>
  );
};

export default StudentCoursePage;
