"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

const CourseDetailsPage = () => {
  const { courseId } = useParams(); // Capture dynamic route param
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Retrieve token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login"); // Redirect to login if token is not found
    }
  }, []);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch course details
        const courseResponse = await fetch(
          `http://localhost:4000/courses/${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error(`Failed to fetch course details: ${courseResponse.statusText}`);
        }

        const courseData = await courseResponse.json();
        setCourseDetails(courseData);

        // Fetch modules
        const modulesResponse = await fetch(
          `http://localhost:4000/courses/${courseId}/modules`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!modulesResponse.ok) {
          throw new Error(`Failed to fetch modules: ${modulesResponse.statusText}`);
        }

        const modulesData = await modulesResponse.json();
        setModules(modulesData);

        // Fetch enrolled students with roles
        const studentPromises = courseData.enrolledStudents.map(async (studentId: string) => {
          const userResponse = await fetch(
            `http://localhost:4000/users/find-user/${studentId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user details: ${userResponse.statusText}`);
          }

          return userResponse.json();
        });

        const studentsData = await Promise.all(studentPromises);
        setEnrolledStudents(studentsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    } else {
      setError("Course ID is missing.");
    }
  }, [courseId, token]);

  const handleModuleClick = (moduleId: string) => {
    router.push(`/course/studentDetails/${courseId}/${moduleId}`);
  };

  const handleCreate1to1Chat = async (participantId: string) => {
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
    } catch (err) {
      alert("Failed to create 1:1 chat. Error: " + err.message);
    }
  };

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
      setSelectedStudents([]); // Reset selected students
    } catch (err) {
      alert("Failed to create group chat. Error: " + err.message);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  if (loading) return <div style={styles.loading}>Loading course details...</div>;

  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Course Details</h1>
      </div>
      <div style={styles.card}>
        <p>
          <strong>Title:</strong> {courseDetails?.title || "N/A"}
        </p>
        <p>
          <strong>Description:</strong> {courseDetails?.description || "N/A"}
        </p>
      </div>

      <h2 style={styles.subtitle}>Enrolled Students</h2>
      <div style={styles.listContainer}>
        {enrolledStudents.length > 0 ? (
          <ul style={styles.list}>
            {enrolledStudents.map((student) => (
              <li key={student._id} style={styles.listItem}>
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => toggleStudentSelection(student._id)}
                />
                {student.email}
                <button
                  onClick={() => handleCreate1to1Chat(student._id)}
                  style={styles.chatButton}
                >
                  Create 1:1 Chat
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={styles.noData}>No enrolled students for this course.</p>
        )}
      </div>

      <button onClick={handleCreateGroupChat} style={styles.groupChatButton}>
        Create Group Chat
      </button>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#444",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: "1.5rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  subtitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  listContainer: {
    marginBottom: "2rem",
  },
  list: {
    listStyleType: "none",
    padding: 0,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 1rem",
    borderBottom: "1px solid #ddd",
  },
  chatButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  groupChatButton: {
    display: "block",
    margin: "1rem auto",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
};

export default CourseDetailsPage;

