"use client";

import React, { useState, useEffect } from "react";
import { Menu, MenuItem, IconButton, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SortIcon from "@mui/icons-material/Sort";
import { useRouter } from "next/navigation";
import CreateCourse from "./Course_Components/create_course";
import ViewEnrolled from "./Course_Components/view_enrolled";
import EditCourse from "./Course_Components/edit_course";
import Cookies from "js-cookie";

const CoursePage = () => {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showViewEnrolled, setShowViewEnrolled] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  // Retrieve token from localStorage
  useEffect(() => {
    const token = Cookies.get("authToken"); // Replace 'authToken' with your token's key
    if (token) {
      setToken(token);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login"); // Redirect to login if token is not found
    }
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    if (!token) return;

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
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.keywords.some((keyword: string) => keyword.toLowerCase().includes(query))
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  };

  // Sort courses by date (newest first)
  const handleSortByDate = () => {
    const sortedCourses = [...filteredCourses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setFilteredCourses(sortedCourses);
  };

  // Open menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, courseId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourseId(courseId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourseId(null);
  };

  // Open the Edit Course Modal
  const handleOpenEditCourse = (course: any) => {
    setSelectedCourse(course);
    setShowEditCourse(true);
  };

  const handleCloseEditCourse = () => {
    setShowEditCourse(false);
    setSelectedCourse(null);
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

      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
      setFilteredCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseId));
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

  // Open the View Enrolled Modal
  const handleOpenViewEnrolled = () => {
    setShowViewEnrolled(true);
  };

  const handleCloseViewEnrolled = () => {
    setShowViewEnrolled(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>Your Courses</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <IconButton onClick={handleSortByDate} style={{ cursor: "pointer" }}>
            <SortIcon />
          </IconButton>
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
          <button
            onClick={handleOpenViewEnrolled}
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            View Enrolled
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by name or keyword"
        value={searchQuery}
        onChange={handleSearch}
        style={{
          padding: "0.5rem",
          width: "100%",
          marginBottom: "1rem",
          fontSize: "1rem",
          borderRadius: "4px",
          border: "1px solid #ddd",
        }}
      />

      {/* Create Course Modal */}
      {showCreateCourse && <CreateCourse onClose={handleCloseCreateCourse} />}

      {/* Edit Course Modal */}
      {showEditCourse && selectedCourse && (
        <EditCourse
          course={selectedCourse}
          onClose={handleCloseEditCourse}
          onSuccess={fetchCourses}
        />
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "2rem" }}>
          Error: {error}
        </p>
      )}

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredCourses.map((course) => (
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
              <div>
                <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#333" }}>{course.title}</h3>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                  Keywords: {course.keywords.join(", ")}
                </p>
              </div>

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
                  <MenuItem onClick={() => handleOpenEditCourse(course)}>Edit Course</MenuItem>
                  <MenuItem onClick={() => console.log("Create Module clicked")}>Create Module</MenuItem>
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

      {/* View Enrolled Modal */}
      {showViewEnrolled && <ViewEnrolled onClose={handleCloseViewEnrolled} />}
    </div>
  );
};

export default CoursePage;
