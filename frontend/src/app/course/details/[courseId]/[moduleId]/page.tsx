"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const ModuleDetails = () => {
  const { courseId, moduleId } = useParams(); // Get courseId and moduleId from route params
  const [moduleDetails, setModuleDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWMzN2E3OGZiMjVjNzE2YzQwNTJkYyIsImVtYWlsIjoibWFyaW5hQGV4YW1wbGUuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MzQzNjY3MjMsImV4cCI6MTczNDQ1MzEyM30.VbviQRiZD0SmL6WVimwmjzFZlVt-XrWXVrtSFSvP8bs"; // Replace with dynamic JWT token logic

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/courses/${courseId}/modules/${moduleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`Failed to fetch module details: ${response.statusText}`);

        const data = await response.json();
        setModuleDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleDetails();
  }, [courseId, moduleId]);

  // Function to download module files
  const handleDownloadFiles = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}/files`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download files: ${response.statusText}`);
      }

      // Get the filename from the response headers
      const disposition = response.headers.get("Content-Disposition");
      const fileName = disposition?.split("filename=")[1] || "module_files.zip";

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a link element to trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName.replace(/"/g, ""); // Clean filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("Download initiated");
    } catch (err: any) {
      console.error("Error downloading files:", err.message);
      setError("Failed to download files. Please try again.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Module Details</h1>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          marginBottom: "1.5rem",
        }}
      >
        <p>
          <strong>Title:</strong> {moduleDetails?.title}
        </p>
        <p>
          <strong>Content:</strong> {moduleDetails?.content || "No content provided"}
        </p>
        <p>
          <strong>Difficulty Level:</strong> {moduleDetails?.difficultyLevel}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {moduleDetails?.createdAt ? new Date(moduleDetails.createdAt).toLocaleString() : "N/A"}
        </p>
      </div>

      {/* Download Module Files Button */}
      <button
        onClick={handleDownloadFiles}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "block",
          margin: "0 auto",
        }}
      >
        Download Module Files
      </button>
    </div>
  );
};

export default ModuleDetails;
