"use client";

import React, { useState, useEffect } from "react";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import CreateCourse from "./Course_Components/create_course"; // Import the CreateCourse component

const CoursePage = () => {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const router = useRouter();

  // Hardcoded token for testing
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWMzN2E3OGZiMjVjNzE2YzQwNTJkYyIsImVtYWlsIjoibWFyaW5hQGV4YW1wbGUuY29tIiwicm9sZSI6Imluc3RydWN0b3IiLCJpYXQiOjE3MzQzNjEyNDcsImV4cCI6MTczNDQ0NzY0N30.Ln1CwAvCXLa1_Egx8BnNPZEdlo_gjpGxsyROCJWvvws";

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:4000/courses/instructor/my-courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCourses(data); // Update state with fetched courses
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, courseId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourseId(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourseId(null);
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete course. Status: ${response.statusText}`);
      }

      // Remove the deleted course from state
      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Delete course error:", err.message);
      setError(`Failed to delete course: ${err.message}`);
    }
  };

  // Navigate to Course Details
  const handleViewCourseDetails = (courseId: string) => {
    router.push(`/course/details/${courseId}`);
  };

  // Open the Create Course Modal
  const handleOpenCreateCourse = () => {
    setShowCreateCourse(true);
  };

  const handleCloseCreateCourse = () => {
    setShowCreateCourse(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Your Courses</h1>
        <button
          onClick={handleOpenCreateCourse}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Create Course
        </button>
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <CreateCourse onClose={handleCloseCreateCourse} />
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "2rem" }}>
          Error: {error}
        </p>
      )}

      {/* Course List */}
      {courses.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#f9f9f9",
              }}
            >
              {/* Course Title */}
              <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#333" }}>{course.title}</h3>

              {/* Three Dots Menu */}
              <div>
                <IconButton
                  aria-controls={`menu-${course._id}`}
                  aria-haspopup="true"
                  onClick={(event) => handleMenuOpen(event, course._id)}
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  id={`menu-${course._id}`}
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedCourseId === course._id}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={() => console.log("Create Module clicked")}>Create Module</MenuItem>
                  <MenuItem onClick={() => console.log("Edit Course clicked")}>Edit Course</MenuItem>
                  <MenuItem onClick={() => setDeleteDialogOpen(true)}>Delete Course</MenuItem>
                  <MenuItem onClick={() => handleViewCourseDetails(course._id)}>Course Details</MenuItem>
                </Menu>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#666" }}>No courses found.</p>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure you want to delete this course?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteCourse(selectedCourseId || "")}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CoursePage;
