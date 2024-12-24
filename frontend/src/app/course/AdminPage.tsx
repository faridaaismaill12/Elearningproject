"use client";

import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";

const AdminPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get("authToken");
  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:4000/courses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch courses");

        const data = await response.json();
        setCourses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  // Delete a course
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await fetch(`http://localhost:4000/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token here too
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete course");

      // Remove the course from the local state
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      alert("Course deleted successfully");
    } catch (err: any) {
      alert(`Error deleting course: ${err.message}`);
    }
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Admin Page</h1>
      <h2>All Courses</h2>
      {courses.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map((course) => (
            <li
              key={course._id}
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "1rem",
                backgroundColor: "#f9f9f9",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <p>
                <strong>Title:</strong> {course.title}
              </p>
              <p>
                <strong>Description:</strong> {course.description}
              </p>
              <button
                onClick={() => handleDeleteCourse(course._id)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete Course
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No courses available</p>
      )}
    </div>
  );
};

export default AdminPage;
