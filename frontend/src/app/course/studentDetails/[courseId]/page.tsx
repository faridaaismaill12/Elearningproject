"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

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

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      setToken(token);
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decodedToken.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch course details
        const courseResponse = await axios.get(
          `http://localhost:4000/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseDetails(courseResponse.data);

        // Fetch modules
        const modulesResponse = await axios.get(
          `http://localhost:4000/courses/${courseId}/modules`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setModules(modulesResponse.data);

        // Fetch enrolled students
        const studentPromises = courseResponse.data.enrolledStudents.map(
          async (studentId: string) => {
            try {
              const userResponse = await axios.get(
                `http://localhost:4000/users/find-user/${studentId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              return userResponse.data;
            } catch (err) {
              console.error(`Error fetching student data for ID ${studentId}`, err);
              return null; // Handle invalid student data gracefully
            }
          }
        );
        const studentsData = (await Promise.all(studentPromises)).filter(Boolean); // Filter out null values
        setEnrolledStudents(studentsData);

        // Fetch average quiz score
        const averageScoreResponse = await axios.get(
          `http://localhost:4000/student/quizzes/average-scores/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(averageScoreResponse.data);
        setAverageScore(averageScoreResponse.data.averageScore);
      } catch (err: any) {
        console.error("Error fetching data:", err.message);
        setError("Failed to fetch course details. Please try again.");
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

  if (loading) return <div className="text-center mt-10">Loading course details...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Course Details</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p className="text-lg font-semibold">
          <strong>Title:</strong> {courseDetails?.title || "N/A"}
        </p>
        <p className="text-lg">
          <strong>Description:</strong> {courseDetails?.description || "N/A"}
        </p>
        <p className="text-lg">
          <strong>Your Average Quiz Score:</strong>{" "}
          {averageScore !== null ? `${averageScore.toFixed(2)}%` : "No scores yet"}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Modules</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <li
            key={module._id}
            className="bg-gray-100 p-4 rounded-lg shadow-md hover:bg-blue-100 cursor-pointer"
            onClick={() => handleModuleClick(module._id)}
          >
            {module.title}
          </li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Enrolled Students</h2>
      <ul className="space-y-4">
        {enrolledStudents.map((student) => (
          <li
            key={student._id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-md"
          >
            <span>{student.email}</span>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student._id)}
                onChange={() => toggleStudentSelection(student._id)}
              />
              {student._id !== currentUserId && (
                <button
                  onClick={() => handleCreate1to1Chat(student._id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  Create 1:1 Chat
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleCreateGroupChat}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Create Group Chat
        </button>
        <button
          onClick={handleViewForums}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
        >
          View Forums
        </button>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
