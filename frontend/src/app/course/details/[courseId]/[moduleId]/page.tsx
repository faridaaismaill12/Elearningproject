"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UpdateModule from "../../../Course_Components/update_module";
import CreateLesson from "../../../Course_Components/create_lesson";
import AddFile from "../../../Course_Components/add_file";
import UploadVideo from "../../../Course_Components/upload_video";

const ModuleDetails = () => {
  const { courseId: courseIdParam, moduleId: moduleIdParam } = useParams();
  const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;
  const moduleId = Array.isArray(moduleIdParam) ? moduleIdParam[0] : moduleIdParam;

  const [moduleDetails, setModuleDetails] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);
  const [showCreateLessonForm, setShowCreateLessonForm] = useState<boolean>(false);
  const [showAddFileForm, setShowAddFileForm] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [showUploadVideoForm, setShowUploadVideoForm] = useState<boolean>(false);

  const router = useRouter();

  // Retrieve token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setToken(token);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login");
    }
  }, []);

  const fetchModuleDetails = async () => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:4000/courses/${courseId}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch module details: ${response.statusText}`);

      const data = await response.json();
      setModuleDetails(data);
      setLessons(data.lessons || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleDetails();
  }, [courseId, moduleId, token]);

  const handleCheckboxChange = async (checked: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ outdated: checked }),
        }
      );

      if (!response.ok) throw new Error("Failed to update module");

      const updatedModule = await response.json();
      setModuleDetails(updatedModule);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadFiles = async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:4000/courses/${courseId}/modules/${moduleId}/files`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error(`Failed to download files: ${response.statusText}`);

      const disposition = response.headers.get("Content-Disposition");
      const fileName = disposition?.split("filename=")[1] || "module_files.zip";
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName.replace(/"/g, "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setError("Failed to download files. Please try again.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  if (showUpdateForm) {
    return (
      <UpdateModule
        courseId={courseId}
        moduleId={moduleId}
        currentDetails={moduleDetails}
        onClose={() => setShowUpdateForm(false)}
      />
    );
  }

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
        <div style={{ marginTop: "1rem" }}>
          <label>
            <strong>Outdated:</strong>
            <input
              type="checkbox"
              checked={moduleDetails?.outdated}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              style={{ marginLeft: "1rem" }}
            />
          </label>
        </div>
      </div>

      {/* Lessons Display */}
      <h2>Lessons</h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "1rem",
          padding: "1rem 0",
          borderTop: "1px solid #ddd",
          borderBottom: "1px solid #ddd",
        }}
      >
        {lessons.map((lesson, index) => (
          <div
            key={index}
            style={{
              minWidth: "200px",
              padding: "1rem",
              backgroundColor: "#f1f1f1",
              borderRadius: "8px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem" }}>{lesson.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "#555" }}>{lesson.content}</p>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1rem",
        }}
      >
        <button onClick={handleDownloadFiles} style={buttonStyle("#007bff")}>
          Download Files
        </button>
        <button onClick={() => setShowUpdateForm(true)} style={buttonStyle("#28a745")}>
          Update Module
        </button>
        <button onClick={() => setShowCreateLessonForm(true)} style={buttonStyle("#17a2b8")}>
          Create Lesson
        </button>
        <button onClick={() => setShowAddFileForm(true)} style={buttonStyle("#ffc107")}>
          Add Files
        </button>
        <button onClick={() => setShowUploadVideoForm(true)} style={buttonStyle("#6c757d")}>
          Upload Video
        </button>
        <button onClick={() => router.push(`/instructor/${moduleId}/quizzes/create`)} style={buttonStyle("#6f42c1")}>
          Create Quiz
        </button>
        <button onClick={() => router.push(`/instructor/${moduleId}/quizzes/dashboard`)} style={buttonStyle("#20c997")}>
          Go to Dashboard
        </button>
      </div>

      {/* Render CreateLesson Form */}
      {showCreateLessonForm && (
        <div style={{ marginTop: "2rem" }}>
          <CreateLesson courseId={courseId} moduleId={moduleId} onClose={() => setShowCreateLessonForm(false)} />
        </div>
      )}

      {/* Render AddFile Form */}
      {showAddFileForm && (
        <div style={{ marginTop: "2rem" }}>
          <AddFile courseId={courseId} moduleId={moduleId} onClose={() => setShowAddFileForm(false)} />
        </div>
      )}

      {/* Render UploadVideo Form */}
      {showUploadVideoForm && (
        <div style={{ marginTop: "2rem" }}>
          <UploadVideo courseId={courseId} moduleId={moduleId} onClose={() => setShowUploadVideoForm(false)} />
        </div>
      )}
    </div>
  );
};

// Button styling function
const buttonStyle = (bgColor: string): React.CSSProperties => ({
  padding: "0.5rem 1rem",
  backgroundColor: bgColor,
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "1rem",
  transition: "background-color 0.3s",
  textAlign: "center" as "center",
  minWidth: "120px",
});

export default ModuleDetails;
