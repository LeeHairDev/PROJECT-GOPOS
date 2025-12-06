import { useState, useCallback } from "react";

export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = "info", duration = 3000) => {
      const id = Date.now();
      const notification = { id, message, type };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const success = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, "success", duration);
    },
    [addNotification]
  );

  const error = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, "error", duration);
    },
    [addNotification]
  );

  const warning = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, "warning", duration);
    },
    [addNotification]
  );

  const info = useCallback(
    (message, duration = 3000) => {
      return addNotification(message, "info", duration);
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
}
