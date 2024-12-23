"use client";

import React, { useState } from "react";

interface CreateCourseProps {
  onClose: () => void;
}

const CreateCourse: React.FC<CreateCourseProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // Updated field
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]); // Keywords state
  const [currentKeyword, setCurrentKeyword] = useState(""); // Temporary input value
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    const courseData = {
      title,
      description, // Updated field
      difficultyLevel,
      keywords, // Include keywords in the payload
    };

    try {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWMzN2E3OGZiMjVjNzE2YzQwNTJkYyIsImVtYWlsIjoibWFyaW5hQGV4YW1wbGUuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MzQ3NzY2NzksImV4cCI6MTczNDg2MzA3OX0.VmALJZC32xy7mGwCDYcOxCxWtOE1TyEVH_1T2bu4sAw";

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

  const handleKeywordAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentKeyword.trim()) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const handleKeywordRemove = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
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
        <div style={styles.keywordsContainer}>
          <input
            type="text"
            placeholder="Add a keyword and press Enter"
            value={currentKeyword}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleKeywordAdd}
            style={styles.input}
          />
          <div style={styles.keywordsList}>
            {keywords.map((keyword, index) => (
              <span key={index} style={styles.keyword}>
                {keyword}
                <button
                  style={styles.removeKeywordButton}
                  onClick={() => handleKeywordRemove(index)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
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
  keywordsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  keywordsList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
  },
  keyword: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  removeKeywordButton: {
    background: "none",
    border: "none",
    color: "#f44336",
    marginLeft: "0.5rem",
    cursor: "pointer",
    fontSize: "1rem",
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
