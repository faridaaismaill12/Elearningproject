"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyChats() {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState("");

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:4000/communication/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(response.data); // Update the chats state with the API response
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to fetch chats");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    fetchChats(); // Call the function when the component mounts
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">My Chats</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="w-full max-w-md">
        {chats.length > 0 ? (
          chats.map((chat: any) => (
            <li
              key={chat._id}
              className="bg-white p-4 shadow mb-2 rounded cursor-pointer hover:bg-gray-200"
              onClick={() => {
                window.location.href = `/communication/chats/chat-room/${chat._id}`;
              }}
            >
              <h3 className="font-bold">{chat.title}</h3>
              <p>
                Participants:{" "}
                {chat.participants.map((participant: any) => participant.name).join(", ")}
              </p>
              {chat.lastMessage ? (
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">{chat.lastMessage.sender?.name || "Unknown"}:</span>{" "}
                  {chat.lastMessage.content}
                </p>
              ) : (
                <p className="text-gray-400 text-sm">No messages yet</p>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-600">No chats available.</p>
        )}
      </ul>
    </div>
  );
}
