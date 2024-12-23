"use client";

import React, { useState } from "react";

interface CreateCourseProps {
  onClose: () => void;
}

const CreateCourse: React.FC<CreateCourseProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Updated field
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    const courseData = {
      title,
      description, // Updated field
      difficultyLevel,
    };

    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWMzN2E3OGZiMjVjNzE2YzQwNTJkYyIsImVtYWlsIjoibWFyaW5hQGV4YW1wbGUuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MzQzNTMzMDUsImV4cCI6MTczNDQzOTcwNX0.eb7Z24Mh3LuYs8IfPvze0LI7rx4_6VxdsNq9T2Bc2yU";

      const response = await fetch("http://localhost:4000/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      alert("Course created successfully!");
      onClose();
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Create Course</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Description" // Updated field
          value={description}
          onChange={(e) => setDescription(e.target.value)} // Updated field
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Difficulty Level"
          value={difficultyLevel}
          onChange={(e) => setDifficultyLevel(e.target.value)}
          style={styles.input}
        />
        <div style={styles.buttonContainer}>
          <button onClick={handleCreate} style={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
          <button onClick={onClose} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
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
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  button: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
};

export default CreateCourse;
