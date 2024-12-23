"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function ViewAllForums() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [forums, setForums] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [newForumContent, setNewForumContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchForumsAndCourse = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        // Fetch forums
        const forumsResponse = await axios.get(
          `http://localhost:4000/forums/by-course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch user details for each forum's creator
        const forumsWithCreators = await Promise.all(
          forumsResponse.data.map(async (forum) => {
            const userResponse = await axios.get(
              `http://localhost:4000/users/find-user/${forum.createdBy}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...forum, createdByName: userResponse.data.name || "Unknown User" };
          })
        );

        setForums(forumsWithCreators);

        // Fetch course details to get the course name
        const courseResponse = await axios.get(
          `http://localhost:4000/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseName(courseResponse.data.title || "Unknown Course");
      } catch (err) {
        setError("Failed to fetch forums or course details.");
      }
    };

    if (courseId) fetchForumsAndCourse();
  }, [courseId]);

  const handleAddForum = async () => {
    if (!newForumContent.trim()) {
      setError("Forum content cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/forums/create",
        { title: newForumContent, course: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add the new forum to the list
      const userResponse = await axios.get(
        `http://localhost:4000/users/find-user/${response.data.createdBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newForum = { ...response.data, createdByName: userResponse.data.name || "Unknown User" };
      // console.log(newForum);

      setForums((prevForums) => [...prevForums, newForum]);
      setNewForumContent("");
      setSuccess("Forum added successfully!");
      setError("");
    } catch (err) {
      setError("Failed to add forum.");
      setSuccess("");
    }
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Forums for {courseName}</h1>

      {/* Success/Error Messages */}
      {success && <p className="text-green-500">{success}</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Add New Forum Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Forum</h2>
        <textarea
          className="w-full p-2 border rounded mb-4"
          rows={4}
          placeholder="Enter forum content here..."
          value={newForumContent}
          onChange={(e) => setNewForumContent(e.target.value)}
        />
        <button
          onClick={handleAddForum}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          Add Forum
        </button>
      </div>

      {/* List Forums */}
      <div>
        {forums.length > 0 ? (
          forums.map((forum) => (
            <Link key={forum._id} href={`/communication/forums/${forum._id}`}>
              <div className="bg-white p-4 rounded shadow mb-4">
                <h2 className="text-xl font-semibold">{forum.title}</h2>
                <p>{forum.description || ""}</p>
                <p className="text-gray-600 text-sm">
                  Created By: {forum.createdByName} |{" "}
                  {forum.createdAt
                    ? new Date(forum.createdAt).toLocaleString()
                    : "Unknown Date"}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>No forums available for this course.</p>
        )}
      </div>
    </div>
  );
}
