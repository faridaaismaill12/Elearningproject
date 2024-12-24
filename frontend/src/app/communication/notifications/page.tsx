"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { showToast } from "../../../utils/toastHelper";
import "./Notification.css";
import Cookies from "js-cookie";

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
        const response = await axios.get("http://localhost:4000/notifications", {
          headers: {
            Authorization: `Bearer ${ Cookies.get("authToken")}`,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        showToast("Failed to load notifications!", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const newSocket = io("http://localhost:4000", {
      query: { token:  Cookies.get("authToken") },
    });

    setSocket(newSocket);

    newSocket.on("newNotification", (newNotification: Notification) => {
      setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
      ]);
      showToast("You have a new notification!", "info");
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:4000/notifications/${id}/read`,
        null,
        {
          headers: {
            Authorization: `Bearer ${ Cookies.get("authToken")}`,
          },
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      showToast("Notification marked as read!", "success");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showToast("Failed to mark notification as read!", "error");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${ Cookies.get("authToken")}`,
        },
      });
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== id)
      );
      showToast("Notification deleted!", "success");
    } catch (error) {
      console.error("Error deleting notification:", error);
      showToast("Failed to delete notification!", "error");
    }
  };

  return (
    <div className="notification_container">
      <h1 className="heading">Notifications</h1>
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : notifications.length > 0 ? (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`notification-item ${
                notification.read ? "read" : "unread"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="notification-message">
                    {notification.message}
                  </p>
                  <p className="notification-date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="action-buttons">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="action-button read"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="action-button delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center">
          <p className="text-lg">No notifications found</p>
          <p className="text-sm">You’re all caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
