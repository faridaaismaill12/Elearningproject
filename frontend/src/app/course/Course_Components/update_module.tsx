"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const UpdateModule = ({ courseId, moduleId, currentDetails, onClose }) => {
  const [title, setTitle] = useState(currentDetails?.title || "");
  const [content, setContent] = useState(currentDetails?.content || "");
  const [difficultyLevel, setDifficultyLevel] = useState(
    currentDetails?.difficultyLevel || "easy"
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWMzN2E3OGZiMjVjNzE2YzQwNTJkYyIsImVtYWlsIjoibWFyaW5hQGV4YW1wbGUuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MzQ2ODQ0NTUsImV4cCI6MTczNDc3MDg1NX0.LYAmmv4QDNDVD3tR2XhjCXSKj5Mul19m9wSCg-ayTFc`,
          },
          body: JSON.stringify({
            title,
            content,
            difficultyLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update module: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Module updated successfully", data);
      router.refresh(); // Refresh the page to fetch updated data
      onClose(); // Close the modal or form
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>Update Module</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "1rem" }}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", height: "100px" }}
        ></textarea>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Difficulty Level:</label>
        <select
          value={difficultyLevel}
          onChange={(e) => setDifficultyLevel(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <button
        onClick={handleUpdate}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Updating..." : "Update Module"}
      </button>
      <button
        onClick={onClose}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          marginLeft: "1rem",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default UpdateModule;