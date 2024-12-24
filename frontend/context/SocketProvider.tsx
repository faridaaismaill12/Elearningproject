'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import io,{ Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface SocketContextType {
  notifications: Notification[];
  socket: typeof Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:6165', {
      query: { token: localStorage.getItem('authToken') },
    });

    setSocket(newSocket);

    newSocket.on('newNotification', (notification: Notification) => {
      // Update the notification list
      setNotifications((prev) => [notification, ...prev]);

      // Show a toast message
      toast.info(`🔔 ${notification.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
