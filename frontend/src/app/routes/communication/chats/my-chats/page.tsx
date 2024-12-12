"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const MyChats = () => {
    const [chats, setChats] = useState([]);
    const router = useRouter();

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:4000/communication/chats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChats(response.data);
        } catch (error) {
            console.error("Error fetching chats:", error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const openChat = (chatId: string) => {
        router.push(`/communication/chats/${chatId}`);
    };

    return (
        <div>
            <h1>My Chats</h1>
            <ul>
                {chats.map((chat: any) => (
                    <li key={chat._id} onClick={() => openChat(chat._id)}>
                        {chat.title || "Untitled Chat"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyChats;
