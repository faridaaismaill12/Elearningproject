"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CreateModule from "../../Course_Components/create_module";

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Get courseId from the route params
  const router = useRouter();

  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModule, setShowCreateModule] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Retrieve token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken"); // Replace 'authToken' with your token's key
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login"); // Redirect to login if token is not found
    }
  }, []);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!token) return;

      try {
        const response = await fetch(`http://localhost:4000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch course details");

        const data = await response.json();
        setCourseDetails(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (courseId) fetchCourseDetails();
  }, [courseId, token]);

  // Open Menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, moduleId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedModuleId(moduleId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedModuleId(null);
  };

  // Navigate to Module Details
  const handleViewModuleDetails = (moduleId: string) => {
    router.push(`/course/details/${courseId}/${moduleId}`);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Course Information */}
      {courseDetails ? (
        <div
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1 style={{ marginBottom: "1rem", fontSize: "2rem", color: "#333" }}>{courseDetails.title}</h1>
          <p>
            <strong>Description:</strong> {courseDetails.description}
          </p>
          <p>
            <strong>Instructor:</strong> {courseDetails.instructor}
          </p>
          <p>
            <strong>Difficulty Level:</strong> {courseDetails.difficultyLevel || "Not specified"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {courseDetails.createdAt ? new Date(courseDetails.createdAt).toLocaleString() : "N/A"}
          </p>
        </div>
      ) : (
        <p style={{ color: "red", textAlign: "center" }}>{error || "Loading course details..."}</p>
      )}

      {/* Header for Modules */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#333" }}>Modules</h2>
        <button
          onClick={() => setShowCreateModule(true)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          + Create Module
        </button>
      </div>

      {/* Modules List */}
      {courseDetails?.modules?.length > 0 ? (
        courseDetails.modules.map((module: any) => (
          <div
            key={module._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              marginBottom: "1rem",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>{module.title}</p>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <p style={{ margin: 0 }}>{module.difficultyLevel}</p>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <IconButton onClick={(e) => handleMenuOpen(e, module._id)}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && selectedModuleId === module._id}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleViewModuleDetails(module._id)}>Module Details</MenuItem>
                <MenuItem onClick={() => console.log("Edit Module")}>Edit Module</MenuItem>
                <MenuItem onClick={() => console.log("Delete Module")}>Delete Module</MenuItem>
              </Menu>
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#555" }}>No modules available.</p>
      )}

      {/* Create Module Component */}
      {showCreateModule && <CreateModule courseId={courseId} onClose={() => setShowCreateModule(false)} />}
    </div>
  );
};

export default CourseDetails;
