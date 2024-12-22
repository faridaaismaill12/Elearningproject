"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CreateModule from "../../Course_Components/create_module";
import axios from "axios";

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>(); // Get courseId from the route params
  const router = useRouter();

  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Retrieve token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
      setCurrentUserId(decodedToken.id); // Extract current user's ID
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login");
    }
  }, []);

  // Fetch course details and enrolled students
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!token) return;

      try {
        const courseResponse = await fetch(`http://localhost:4000/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!courseResponse.ok) throw new Error("Failed to fetch course details");

        const courseData = await courseResponse.json();
        setCourseDetails(courseData);

        const studentPromises = courseData.enrolledStudents.map(async (studentId: string) => {
          const userResponse = await fetch(`http://localhost:4000/users/find-user/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user details: ${userResponse.statusText}`);
          }

          return userResponse.json();
        });

        const studentsData = await Promise.all(studentPromises);
        setEnrolledStudents(studentsData);
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

  // View Forums
  const handleViewForums = () => {
    router.push(`/communication/forums/viewAll?courseId=${courseId}`);
  };

  // Create 1:1 Chat
  const handleCreate1to1Chat = async (participantId: string) => {
    if (participantId === currentUserId) {
      return; // Do not allow creating 1:1 chat with self
    }

    try {
      await axios.post(
        "http://localhost:4000/communication/create-one-to-one-chat",
        {
          recipientId: participantId,
          courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("1:1 Chat created successfully!");
    } catch (err: any) {
      alert(
        "Failed to create 1:1 chat. Error: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Create Group Chat
  const handleCreateGroupChat = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student to create a group chat.");
      return;
    }

    const title = prompt("Enter a title for the group chat:") || "Group Chat";

    try {
      await axios.post(
        "http://localhost:4000/communication/create-group-chat",
        {
          participantIds: selectedStudents,
          courseId,
          title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Group chat created successfully!");
      setSelectedStudents([]);
    } catch (err: any) {
      alert(
        "Failed to create group chat. Error: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId: string) => {
    if (studentId === currentUserId) {
      return; // Prevent selecting yourself
    }

    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
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
        </div>
      ) : (
        <p style={{ color: "red", textAlign: "center" }}>{error || "Loading course details..."}</p>
      )}

      {/* View Forums Button */}
      <button
        onClick={handleViewForums}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#ff5722",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        View Forums
      </button>

      {/* Enrolled Students */}
      <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "1rem" }}>Enrolled Students</h2>
      {enrolledStudents.length > 0 ? (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {enrolledStudents.map((student) => (
            <li
              key={student._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 1rem",
                borderBottom: "1px solid #ddd",
                backgroundColor: student.role === "instructor" ? "#f0f8ff" : "transparent",
              }}
            >
              {student.email}
              {student._id !== currentUserId && (
                <button
                  onClick={() => handleCreate1to1Chat(student._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Create 1:1 Chat
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#555" }}>No students enrolled.</p>
      )}

      {/* Create Group Chat */}
      <button
        onClick={handleCreateGroupChat}
        style={{
          display: "block",
          margin: "1rem auto",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Create Group Chat
      </button>

      {/* Modules Section */}
      <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "1rem" }}>Modules</h2>
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
