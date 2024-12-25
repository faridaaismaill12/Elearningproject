"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const AllCoursesPage = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    courseId: "",
  });
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("authToken");
        if (!token) {
          setError("You must log in to view available courses.");
          router.push("/users/login");
          return;
        }

        const response = await axios.get("http://localhost:4000/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCourses(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleEnroll = async (courseId: string) => {
    setEnrollError(null);
    setSuccess(null);
    setEnrolling(true);

    const token = Cookies.get("authToken");

    if (!token) {
      setEnrollError("You must log in first.");
      setEnrolling(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/users/enroll-user",
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response.data);
      setSuccess(response.data.message || "Successfully enrolled in the course!");
      setFormData({ email: "", courseId: "" });
    } catch (err: any) {
      setEnrollError(err.response?.data?.message || "Failed to enroll in the course.");
    } finally {
      setEnrolling(false);
    }
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
                  backgroundColor: enrolling ? "#ccc" : "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: enrolling ? "not-allowed" : "pointer",
                  marginTop: "1rem",
                }}
                disabled={enrolling}
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No courses available for your level.</p>
      )}
      {enrollError && <p style={{ color: "red" }}>{enrollError}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default AllCoursesPage;
