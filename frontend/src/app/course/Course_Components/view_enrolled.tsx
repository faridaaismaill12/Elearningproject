"use client";

import React, { useState } from "react";

interface ViewEnrolledProps {
  onClose: () => void;
}

const ViewEnrolled: React.FC<ViewEnrolledProps> = ({ onClose }) => {
  const [studentId, setStudentId] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<{ title: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authToken'); 
  const handleFetchEnrolledCourses = async () => {
    if (!studentId.trim()) {
      setError("Student ID cannot be empty.");
      return;
    }

    setLoading(true);
    setError(null);
    setEnrolledCourses([]);

    try {
      const response = await fetch(`http://localhost:4000/users/${studentId}/enrolled-courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch enrolled courses: ${response.statusText}`);
      }

      const data = await response.json();
      setEnrolledCourses(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching enrolled courses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>View Enrolled Courses</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={handleFetchEnrolledCourses}
          style={styles.fetchButton}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Enrolled Courses"}
        </button>

        {!loading && enrolledCourses.length > 0 && (
          <ul style={styles.list}>
            {enrolledCourses.map((course, index) => (
              <li key={index} style={styles.listItem}>
                {course.title}
              </li>
            ))}
          </ul>
        )}

        {!loading && enrolledCourses.length === 0 && !error && (
          <p>No enrolled courses found for this student.</p>
        )}

        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    width: "400px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  fetchButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  list: {
    listStyleType: "none" as const,
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: "0.5rem",
    backgroundColor: "#f1f1f1",
    borderRadius: "4px",
    marginBottom: "0.5rem",
  },
  error: {
    color: "red",
  },
  closeButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default ViewEnrolled;
