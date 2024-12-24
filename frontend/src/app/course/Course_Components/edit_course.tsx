"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
interface EditCourseProps {
  course: any; // Pass the current course details
  onClose: () => void; // Function to close the modal
  onSuccess: () => void; // Function to refresh the course list after successful update
}

const EditCourse: React.FC<EditCourseProps> = ({ course, onClose, onSuccess }) => {
  const [title, setTitle] = useState(course.title || "");
  const [description, setDescription] = useState(course.description || "");
  const [difficultyLevel, setDifficultyLevel] = useState(course.difficultyLevel || "");
  const [keywords, setKeywords] = useState<string[]>(course.keywords || []);
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = Cookies.get("authToken");
  const handleUpdateCourse = async () => {
    setLoading(true);
    setError("");

    const updatedCourseData = {
      title,
      description,
      difficultyLevel,
      keywords,
    };

    try {
      const response = await fetch(`http://localhost:4000/courses/${course._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCourseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }

      alert("Course updated successfully!");
      onSuccess(); // Refresh the course list
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error updating course:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Edit Course</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...styles.input, height: "80px" }}
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
            placeholder="Add a keyword"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
            style={styles.input}
          />
          <button onClick={handleAddKeyword} style={styles.addKeywordButton}>
            Add
          </button>
          <div style={styles.keywordsList}>
            {keywords.map((keyword, index) => (
              <span key={index} style={styles.keyword}>
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  style={styles.removeKeywordButton}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={handleUpdateCourse}
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
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
    backgroundColor: "#f1f1f1",
    padding: "0.3rem 0.5rem",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
  },
  removeKeywordButton: {
    marginLeft: "0.5rem",
    background: "none",
    border: "none",
    color: "#f00",
    cursor: "pointer",
  },
  addKeywordButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
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

export default EditCourse;
