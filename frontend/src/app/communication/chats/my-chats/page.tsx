'use client';

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import './MyChat.css'; 
import io, { Socket } from "socket.io-client";

interface ChatRoom {
  _id: string;
  title: string;
  participants: { name: string }[];
  lastMessage?: { sender: { name: string }; content: string; timestamp: string };
}

interface Message {
  chatRoomId: string;
  sender: { _id: string; name: string };
  content: string;
  timestamp: string;
}

let socket: Socket | null = null;

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState({ id: '', name: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatRooms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get('http://localhost:4000/communication/chats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchChatDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get(
        `http://localhost:4000/communication/chat-history/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(response.data.messages || []);
      setSelectedChat(response.data);

      if (socket) socket.disconnect();

      socket = io(`http://localhost:4000?token=${token}`, {
        query: { chatRoomId: chatId },
      });

      socket.on('receiveMessage', (message: Message) => {
        if (message.chatRoomId === chatId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        if (socket) {
          socket.off('receiveMessage');
          socket.disconnect();
        }
      };
    } catch (error) {
      console.error('Error fetching chat details:', error);
    }
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setCurrentUser({ id: decodedToken.id, name: decodedToken.name });
  };

  const sendMessage = () => {
    if (socket && newMessage.trim() && selectedChat) {
      const messageToSend = {
        chatRoomId: selectedChat._id,
        content: newMessage,
        sender: { _id: currentUser.id, name: currentUser.name || 'You' },
        timestamp: new Date().toISOString(),
      };

      socket.emit('sendMessage', { chatRoomId: selectedChat._id, content: newMessage });
      setMessages((prev) => [...prev, messageToSend]);
      setNewMessage('');
    }
  };

  useEffect(() => {
    fetchChatRooms();
    fetchCurrentUser();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-page">
      <div className="chat-room-list">
        <h2>Chats</h2>
        <ul>
          {chatRooms.map((chat) => (
            <li
              key={chat._id}
              onClick={() => fetchChatDetails(chat._id)}
              className={`chat-room-item ${selectedChat?._id === chat._id ? 'selected' : ''}`}
            >
              <h3>{chat.title}</h3>
              <p>Participants: {chat.participants.map((p) => p.name).join(', ')}</p>
              {chat.lastMessage ? (
                <p className="last-message">
                  <span>{chat.lastMessage.sender.name}:</span> {chat.lastMessage.content}
                  <span>{new Date(chat.lastMessage.timestamp).toLocaleTimeString()}</span>
                </p>
              ) : (
                <p>No messages yet</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-room">
        {selectedChat ? (
          <>
            <div className="chat-room-header">
              <h2>{selectedChat.title}</h2>
            </div>
            <div className="messages-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${
                    message.sender._id === currentUser.id ? 'bubble-sent' : 'bubble-received'
                  }`}
                >
                  <p><strong>{message.sender.name}:</strong> {message.content}</p>
                  <small>{new Date(message.timestamp).toLocaleTimeString()}</small>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty-chat-message">
            <p>Select a chat to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}