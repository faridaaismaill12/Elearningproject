"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import axios from "axios";

let socket: Socket | null = null;

export default function ChatRoom() {
  const { chatId } = useParams(); // Get `chatId` from URL params
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });
  const [chatTitle, setChatTitle] = useState("");

  // Fetch chat details, including the title
  const fetchChatDetails = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        return;
      }

      const response = await axios.get(
        `http://localhost:4000/communication/chat-history/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Set the chat title and messages
      setChatTitle(response.data.title);
      setMessages(response.data.messages || []);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Failed to load chat details");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const fetchCurrentUser = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    setCurrentUser({ id: decodedToken.id, name: decodedToken.name });
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchChatDetails();

    // Establish socket connection
    const token = localStorage.getItem("authToken");
    socket = io(`http://localhost:4000?token=${token}`, {
      auth: { token },
    });


    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [chatId]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      const messageToSend = {
        chatRoomId: chatId,
        content: newMessage,
        sender: {
          _id: currentUser.id,
          name: currentUser.name || "You",
        },
        timestamp: new Date().toISOString(),
      };

      // Emit the message to the server
      socket.emit("sendMessage", {
        chatRoomId: chatId,
        content: newMessage,
      });

      // Update the local state immediately
      
      setMessages((prevMessages) => [...prevMessages, messageToSend]);
      setNewMessage(""); // Clear the input field
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-4">{chatTitle || "Chat Room"}</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="bg-white shadow-md rounded px-4 py-6 w-full max-w-2xl">
        <div className="overflow-y-scroll h-64 mb-4">
          {messages.map((message: any, index: number) => (
            <div
              key={index}
              className={`mb-2 flex ${
                message.sender._id === currentUser.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-md shadow ${
                  message.sender._id === currentUser.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <p className="font-semibold">{message.sender.name || "Unknown"}:</p>
                <p>{message.content}</p>
                <small className="text-xs text-gray-600">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow border border-gray-300 rounded-md px-4 py-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
