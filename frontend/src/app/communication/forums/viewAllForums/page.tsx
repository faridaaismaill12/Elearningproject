"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { FaComments, FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForumPage() {
  const [forums, setForums] = useState([]);
  const [error, setError] = useState("");
  const [newForum, setNewForum] = useState({ title: "", course: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [editingForum, setEditingForum] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({ id: decodedToken.id, role: decodedToken.role });
    } catch (err) {
      console.error("Failed to fetch current user.");
    }
  };

  const fetchForums = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:4000/forums", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForums(response.data);
    } catch (err) {
      setError("Failed to fetch forums.");
    }
  };

  const createForum = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/forums/create",
        newForum,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForums((prev) => [...prev, response.data]);
      setNewForum({ title: "", course: "" });
    } catch (err) {
      setError("Failed to create forum.");
    }
  };

  const deleteForum = async (forumId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:4000/forums/${forumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForums((prev) => prev.filter((forum) => forum._id !== forumId));

      // Toast message on delete
      toast.success("Forum deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError("Failed to delete forum.");
    }
  };

  const editForum = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.put(
        `http://localhost:4000/forums/${editingForum._id}`,
        { title: editingForum.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForums((prev) =>
        prev.map((forum) =>
          forum._id === editingForum._id ? { ...forum, title: response.data.title } : forum
        )
      );

      setEditingForum(null);

      // Toast message on edit
      toast.success("Forum updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      setError("Failed to update forum.");
    }
  };

  const countReplies = (replies) => {
    if (!replies) return 0;
    return replies.reduce(
      (total, reply) =>
        total + 1 + (reply.replies ? countReplies(reply.replies) : 0),
      0
    );
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchForums();
  }, []);

  const canEditOrDelete = (forum) => {
    return (
      currentUser &&
      (forum.createdBy === currentUser.id || currentUser.role === "instructor")
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">Forums</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Create Forum Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create a New Forum</h2>
        <input
          type="text"
          placeholder="Forum Title"
          className="w-full mb-4 p-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newForum.title}
          onChange={(e) => setNewForum({ ...newForum, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Course ID"
          className="w-full mb-4 p-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newForum.course}
          onChange={(e) => setNewForum({ ...newForum, course: e.target.value })}
        />
        <button
          onClick={createForum}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
        >
          Create Forum
        </button>
      </div>

      {/* Forums List Section */}
      <div className="space-y-4">
        {forums.length > 0 ? (
          forums.map((forum) => (
            <div
              key={forum._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition relative"
            >
              {/* Title */}
              <Link href={`/communication/forums/${forum._id}`}>
                <h2 className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-500 transition">
                  {forum.title}
                </h2>
              </Link>
              <p className="text-gray-600 mt-2 flex items-center">
                <FaComments className="mr-2 text-blue-500" />
                {forum.replies ? countReplies(forum.replies) : 0}
              </p>

              {/* Edit and Delete Buttons */}
              {canEditOrDelete(forum) && (
                <div className="absolute top-4 right-4 flex space-x-4">
                  <button
                    onClick={() =>
                      setEditingForum({ _id: forum._id, title: forum.title })
                    }
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => deleteForum(forum._id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <FaTrashAlt className="text-lg" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">No forums available. Create the first one!</p>
        )}
      </div>

      {/* Edit Forum Modal */}
      {editingForum && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Forum</h2>
            <input
              type="text"
              value={editingForum.title}
              onChange={(e) =>
                setEditingForum({ ...editingForum, title: e.target.value })
              }
              className="w-full mb-4 p-3 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditingForum(null)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow mr-2"
              >
                Cancel
              </button>
              <button
                onClick={editForum}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
