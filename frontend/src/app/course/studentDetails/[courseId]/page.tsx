"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
// import "./style.css";


const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Retrieve token from localStorage
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      setToken(token);
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decodedToken.id);
    } else {
      console.error("No token found in localStorage. Redirecting to login...");
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const courseResponse = await axios.get(
          `http://localhost:4000/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseDetails(courseResponse.data);

        const modulesResponse = await axios.get(
          `http://localhost:4000/courses/${courseId}/modules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModules(modulesResponse.data);

        const studentPromises = courseResponse.data.enrolledStudents.map(
          async (studentId: string) => {
            const userResponse = await axios.get(
              `http://localhost:4000/users/find-user/${studentId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return userResponse.data;
          }
        );
        const studentsData = await Promise.all(studentPromises);
        setEnrolledStudents(studentsData);

        const averageScoreResponse = await axios.get(
          `http://localhost:4000/student/quizzes/average-scores/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAverageScore(averageScoreResponse.data.averageScore);
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourseDetails();
  }, [courseId, token]);

  const handleModuleClick = (moduleId: string) => {
    router.push(`/course/studentDetails/${courseId}/${moduleId}`);
  };

  const handleViewForums = () => {
    router.push(`/communication/forums/viewAll?courseId=${courseId}`);
  };

  const handleCreate1to1Chat = async (participantId: string) => {
    if (participantId === currentUserId) {
      return;
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

  const toggleStudentSelection = (studentId: string) => {
    if (studentId === currentUserId) {
      return;
    }

    setSelectedStudents((prevSelected) => {
      if (prevSelected.includes(studentId)) {
        return prevSelected.filter((id) => id !== studentId);
      } else {
        return [...prevSelected, studentId];
      }
    });
  };

  if (loading) return <div className="loading">Loading course details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1 className="title">Course Details</h1>
      <div className="card">
        <p>
          <strong>Title:</strong> {courseDetails?.title || "N/A"}
        </p>
        <p>
          <strong>Description:</strong> {courseDetails?.description || "N/A"}
        </p>
        <p>
          <strong>Your Average Quiz Score:</strong>{" "}
          {averageScore !== null ? `${averageScore.toFixed(2)}%` : "No scores yet"}
        </p>
      </div>

      <h2 className="subtitle">Modules</h2>
      <ul className="list">
        {modules.map((module) => (
          <li
            key={module._id}
            className="module-item"
            onClick={() => handleModuleClick(module._id)}
          >
            {module.title}
          </li>
        ))}
      </ul>

      <h2 className="subtitle">Enrolled Students</h2>
      <ul className="list">
        {enrolledStudents.map((student) => (
          <li key={student._id} className="student-item">
            {student.email}
            <input
              type="checkbox"
              checked={selectedStudents.includes(student._id)}
              onChange={() => toggleStudentSelection(student._id)}
            />
            {student._id !== currentUserId && (
              <button
                onClick={() => handleCreate1to1Chat(student._id)}
                className="chat-button"
              >
                Create 1:1 Chat
              </button>
            )}
          </li>
        ))}
      </ul>

      <button onClick={handleCreateGroupChat} className="group-button">
        Create Group Chat
      </button>
      <button onClick={handleViewForums} className="forum-button">
        View Forums
      </button>
    </div>
  );
};

export default CourseDetailsPage;
