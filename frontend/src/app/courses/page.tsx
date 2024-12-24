"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AllCoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
          const token = Cookies.get("authToken");
        // Fetch the authentication cookie
        const response = await fetch("http://localhost:4000/courses", {
          method: "GET",
           // Include cookies with the request
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = (courseId: string) => {
    // Placeholder for enroll functionality
    console.log(`Enrolling in course: ${courseId}`);
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Available Courses</h1>
      {courses.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                width: "300px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2 style={{ marginBottom: "0.5rem" }}>{course.title}</h2>
              <p>{course.description}</p>
              <p>
                <strong>Difficulty:</strong> {course.difficultyLevel}
              </p>
              <button
                onClick={() => handleEnroll(course._id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "1rem",
                }}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No courses available for your level.</p>
      )}
    </div>
  );
};

export default AllCoursesPage;
