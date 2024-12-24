"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FaReply, FaEdit, FaTrash, FaComment } from "react-icons/fa";
import Cookies from "js-cookie";

export default function ForumDetails() {
  const { id } = useParams();
  const [forum, setForum] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingReply, setEditingReply] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingForum, setEditingForum] = useState(false);
  const [forumTitle, setForumTitle] = useState("");

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("authToken");
      if (!token) return;

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setCurrentUser({ id: decodedToken.id, role: decodedToken.role });
    };

    fetchCurrentUser();
  }, []);

  // Fetch the forum details
  const fetchForum = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const forumResponse = await axios.get(`http://localhost:4000/forums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const forumData = forumResponse.data;

      // Fetch the creator's name for the forum
      const userResponse = await axios.get(
        `http://localhost:4000/users/find-user/${forumData.createdBy}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const creatorName = userResponse.data.name || "Unknown User";
      setForum({ ...forumData, createdByName: creatorName });
      setForumTitle(forumData.title);
    } catch (err) {
      setError("Failed to fetch forum details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForum();
  }, [id]);

  const canEditOrDeleteReply = (reply) => {
    return (
      currentUser &&
      (reply.user._id === currentUser.id || currentUser.role === "instructor")
    );
  };

  const canEditOrDeleteForum = () => {
    return currentUser && (forum.createdBy === currentUser.id || currentUser.role === "instructor");
  };

  // Function to count total replies, including nested ones
  const countTotalReplies = (replies) => {
    if (!replies) return 0;
    return replies.reduce(
      (count, reply) => count + 1 + countTotalReplies(reply.replies),
      0
    );
  };

  // Add or edit a reply
  const handleReplySubmit = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      if (editingReply) {
        await axios.put(
          `http://localhost:4000/forums/replies/${editingReply._id}`,
          { message: newReply },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          replyingTo
            ? `http://localhost:4000/forums/replies/${replyingTo._id}`
            : `http://localhost:4000/forums/${id}/replies`,
          { message: newReply },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchForum(); // Reload the forum details after submission
      setNewReply("");
      setReplyingTo(null);
      setEditingReply(null);
    } catch (err) {
      setError("Failed to submit reply.");
    }
  };

  // Delete a reply
  const deleteReply = async (replyId) => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:4000/forums/replies/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchForum(); // Reload the forum details after deletion
    } catch (err) {
      setError("Failed to delete reply.");
    }
  };

  // Delete the forum
  const deleteForum = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.delete(`http://localhost:4000/forums/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.href = "/"; // Redirect after deletion
    } catch (err) {
      setError("Failed to delete forum.");
    }
  };

  // Edit the forum
  const handleForumEdit = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      await axios.put(
        `http://localhost:4000/forums/${id}`,
        { title: forumTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingForum(false);
      await fetchForum();
    } catch (err) {
      setError("Failed to update forum.");
    }
  };

  const renderReplies = (replies, level = 0) => {
    return replies.map((reply) => (
      <div
        key={reply._id}
        className={`mb-4`}
        style={{
          marginLeft: `${level * 20}px`,
          borderLeft: level > 0 ? "2px solid #ddd" : "none",
          paddingLeft: "16px",
        }}
      >
        <div className="bg-gray-50 p-4 rounded-lg shadow flex justify-between items-start">
          <div>
            <p className="text-gray-800">{reply.message}</p>
            <small className="text-gray-600">
              By: {reply.user?.name || "Unknown User"} |{" "}
              {reply.createdAt
                ? new Date(reply.createdAt).toLocaleString()
                : "Unknown Date"}
            </small>
          </div>
          <div className="flex space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => setReplyingTo(reply)}
            >
              <FaReply />
            </button>
            {canEditOrDeleteReply(reply) && (
              <>
                <button
                  className="text-green-500 hover:text-green-700"
                  onClick={() => {
                    setEditingReply(reply);
                    setNewReply(reply.message);
                  }}
                >
                  <FaEdit />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => deleteReply(reply._id)}
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>
        {reply.replies?.length > 0 && renderReplies(reply.replies, level + 1)}
      </div>
    ));
  };

  if (loading) return <p>Loading...</p>;
  if (!forum) return <p>{error || "Failed to load forum details."}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Forum Title, Created By, and Total Replies */}
      <div className="bg-blue-100 p-4 rounded shadow mb-6 flex flex-col space-y-2">
        {editingForum ? (
          <div>
            <input
              className="w-full p-2 border rounded mb-2"
              value={forumTitle}
              onChange={(e) => setForumTitle(e.target.value)}
            />
            <button
              onClick={handleForumEdit}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditingForum(false)}
              className="bg-red-500 text-white px-4 py-2 rounded ml-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold">{forum.title}</h1>
            <p className="text-gray-700">
              Created By: {forum.createdByName} |{" "}
              {forum.createdAt
                ? new Date(forum.createdAt).toLocaleString()
                : "Unknown Date"}
            </p>
            {canEditOrDeleteForum() && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => setEditingForum(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Edit Forum
                </button>
                <button
                  onClick={deleteForum}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete Forum
                </button>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center space-x-2 text-gray-600">
          <FaComment className="text-xl text-blue-600" />
          <span className="text-lg">
            {forum.replies ? countTotalReplies(forum.replies) : 0}
          </span>
        </div>
      </div>

      {/* Replies Section */}
      <h2 className="text-xl font-semibold mb-4">Replies</h2>
      <div>{forum.replies?.length > 0 ? renderReplies(forum.replies) : <p>No replies yet.</p>}</div>

      {/* Add/Edit Reply Section */}
      <div className="mt-6 bg-white p-6 rounded shadow">
        {replyingTo && (
          <div className="mb-4 text-gray-700">
            <strong>Replying to:</strong> <span>{replyingTo.message}</span>
            <button
              className="text-red-500 ml-2"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </button>
          </div>
        )}
        <textarea
          className="w-full p-2 border rounded mb-4"
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Write your reply here..."
        />
        <button
          onClick={handleReplySubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingReply ? "Save Changes" : "Submit Reply"}
        </button>
      </div>
    </div>
  );
}
