'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import socket from '../services/sockets';
import { toast } from 'react-hot-toast';

interface Notification {
  message: string;
  type: string;
}

interface NotificationContextProps {
  notifications: Notification[];
}

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.on('notification', (data: Notification) => {
      console.log('Received notification:', data);
      setNotifications((prev) => [data, ...prev]);
      toast(`${data.type}: ${data.message}`);
    });

    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
