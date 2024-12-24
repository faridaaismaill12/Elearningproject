"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";

const UploadVideo = ({ courseId, moduleId, onClose }: { courseId: string; moduleId: string; onClose: () => void }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = Cookies.get("authToken");
  const handleVideoUpload = async () => {
    if (!videoFile) {
      setError("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("videos", videoFile);

    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}/videos`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload video");

      alert("Video uploaded successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        margin: "2rem auto",
        textAlign: "center",
      }}
    >
      <h2>Upload Video</h2>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
        style={{ marginBottom: "1rem" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button
          onClick={handleVideoUpload}
          style={buttonStyle("#007bff")}
        >
          Upload
        </button>
        <button
          onClick={onClose}
          style={buttonStyle("#6c757d")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Button styling function
import { CSSProperties } from "react";

const buttonStyle = (bgColor: string): CSSProperties => ({
  padding: "0.5rem 1rem",
  backgroundColor: bgColor,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s",
  textAlign: "center" as CSSProperties["textAlign"],
});

export default UploadVideo;
