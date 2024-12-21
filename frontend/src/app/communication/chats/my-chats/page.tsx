'use client';

import axios from "axios";
import { useEffect, useRef, useState } from "react";
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
  const [participants, setParticipants] = useState({ id: '', name: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms
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

  // Fetch messages for a chat room
  const fetchChatDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token not found.');

      const response = await axios.get(
        `http://localhost:4000/communication/chat-history/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const users=response.data.participants;
      //each loop on the users get the name of the user and the id of the user
      //call the get user by userid on all the users
      //get the name of the user and the id of the user
      //store the name and id of the user in the participants state
      


      setMessages(response.data.messages || []);
      setSelectedChat(response.data);

      // Establish socket connection for the selected chat
      if (socket) socket.disconnect();

      socket = io(`http://localhost:4000?token=${token}`, {
        auth: { token },
        query: { chatRoomId: chatId },
      });

      // Listen for incoming messages for the specific chat
      socket.on('receiveMessage', async (message: Message) => {
        if (message.chatRoomId === chatId) {
          setMessages((prev) => [...prev, message]);
          const response = await axios.get(
            `http://localhost:4000/users/find-user/${message.sender}`,
            // { headers: { Authorization: `Bearer ${token}` } }
          );

          // message.sender.name = response.data.name;
          setParticipants({ id: response.data._id, name: response.data.name });
        }
      });

      // Cleanup on component unmount or chat switch
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

  // Fetch current user details
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const user = await axios.get(
      `http://localhost:4000/users/view-profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    // console.log(user.data);
    setCurrentUser({ id: decodedToken.id, name: user.data.name });
  };

  // Handle sending messages
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
    <div className="flex h-screen">
      {/* Left Column - Chat Rooms */}
      <div className="w-1/3 bg-gray-900 text-white border-r border-gray-800 overflow-y-auto">
        <h2 className="text-xl font-bold p-4 bg-gray-800">Chats</h2>
        <ul>
          {chatRooms.map((chat) => (
            <li
              key={chat._id}
              onClick={() => fetchChatDetails(chat._id)}
              className={`p-4 cursor-pointer ${
                selectedChat?._id === chat._id
                  ? 'bg-gray-700'
                  : 'hover:bg-gray-800'
              }`}
            >
              <h3 className="font-semibold">{chat.title}</h3>
              <p className="text-sm text-gray-400">
                Participants: {chat.participants.map((p) => p.name).join(', ')}
              </p>
              {chat.lastMessage ? (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">{chat.lastMessage.sender.name}:</span>{' '}
                  {chat.lastMessage.content}
                  <span className="ml-2 text-gray-400">
                    {new Date(chat.lastMessage.timestamp).toLocaleTimeString()}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gray-600">No messages yet</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column - Chat Room */}
      <div className="w-2/3 bg-gray-100 flex flex-col">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-300 bg-gray-200">
              <h2 className="text-xl font-bold">{selectedChat.title}</h2>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender._id === currentUser.id ? 'justify-end' : 'justify-start'
                  } mb-2`}
                >
                    <div
                      className={`p-2 rounded-md shadow ${
                        message.sender._id === currentUser.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300'
                      }`}
                    >
                      <p className="font-semibold">{message.sender.name}:</p>
                      <p>{message.content}</p>
                      <small className="text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="p-4 border-t border-gray-300 flex items-center bg-gray-200">
              <input
                type="text"
                className="flex-grow border rounded px-4 py-2"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-grow">
            <p className="text-gray-600">Select a chat to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
