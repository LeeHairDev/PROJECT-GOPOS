import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const useNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on initial load
    try {
      const saved = localStorage.getItem("notifications");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading notifications from localStorage:", error);
      return [];
    }
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const saved = localStorage.getItem("unreadCount");
      return saved ? parseInt(saved) : 0;
    } catch (error) {
      return 0;
    }
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving notifications to localStorage:", error);
    }
  }, [notifications]);

  // Save unread count to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("unreadCount", unreadCount.toString());
    } catch (error) {
      console.error("Error saving unread count to localStorage:", error);
    }
  }, [unreadCount]);

  useEffect(() => {
    // Connect to Socket.io server
    const socket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Listen for new notifications
    socket.on("notification:new", (notification) => {
      const newNotification = {
        ...notification,
        id: Date.now(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Keep only last 50 notifications to avoid storage overflow
      setNotifications((prev) => prev.slice(0, 50));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    removeNotification,
    markAsRead,
    clearAll,
  };
};

export default useNotifications;
