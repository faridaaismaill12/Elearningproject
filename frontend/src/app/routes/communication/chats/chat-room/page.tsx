"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:4000");

const ChatRoom = () => {
    const { chatRoomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    const fetchChatHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:4000/communication/chat-history/${chatRoomId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data.messages);
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    useEffect(() => {
        fetchChatHistory();

        socket.on("receiveMessage", (message) => {
            if (message.chatRoomId === chatRoomId) {
                setMessages((prev) => [...prev, message]);
            }
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [chatRoomId]);

    const sendMessage = () => {
        const token = localStorage.getItem("token");
        socket.emit("sendMessage", {
            chatRoomId,
            content: newMessage,
            token,
        });
        setNewMessage("");
    };

    return (
        <div>
            <h1>Chat Room</h1>
            <ul>
                {messages.map((msg: any, index) => (
                    <li key={index}>
                        <strong>{msg.sender}:</strong> {msg.content}
                    </li>
                ))}
            </ul>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatRoom;
