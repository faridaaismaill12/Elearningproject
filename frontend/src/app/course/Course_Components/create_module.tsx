"use client";

import React, { useState } from "react";

const CreateModule = ({ courseId, onClose }: { courseId: string; onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("easy");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authToken'); 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("difficultyLevel", difficultyLevel);
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch(`http://localhost:4000/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to create module: ${response.statusText}`);
      }

      alert("Module created successfully!");
      onClose(); // Close the modal/form
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        <h2>Create Module</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Content:</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required />

          <label>Difficulty Level:</label>
          <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <label>Upload Files:</label>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" style={{ marginRight: "1rem" }}>
              Create
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModule;
