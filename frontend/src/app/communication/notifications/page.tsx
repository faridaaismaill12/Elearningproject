'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { showToast } from '../../../../utils/toastHelper';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:4000/notifications', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showToast('Failed to load notifications!', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const newSocket = io('http://localhost:4000', {
      query: { token: localStorage.getItem('authToken') },
    });

    setSocket(newSocket);

    newSocket.on('newNotification', (newNotification: Notification) => {
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
      showToast('You have a new notification!', 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`http://localhost:4000/notifications/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      showToast('Notification marked as read!', 'success');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Failed to mark notification as read!', 'error');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
      showToast('Notification deleted!', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Failed to delete notification!', 'error');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
        </div>
      ) : notifications.length > 0 ? (
        <ul className="space-y-6">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-5 rounded-lg shadow-md transform transition-all ${
                notification.read
                  ? 'bg-white hover:shadow-lg hover:scale-105'
                  : 'bg-blue-50 border-l-4 border-blue-500 hover:shadow-lg hover:scale-105'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-800">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-600 font-medium hover:text-blue-800"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-red-500 font-medium hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-600">
          <p className="text-lg">No notifications found</p>
          <p className="text-sm mt-2">You’re all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
