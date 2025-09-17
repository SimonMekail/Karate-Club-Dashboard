import React, { useEffect, useState } from "react";
import { useToast } from "./ToastContext";

const ToastNotification = () => {
  const { toast, hideToast } = useToast();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (toast?.show) {
      const toastId = Date.now();
      const newToast = {
        id: toastId,
        message: toast.message,
        type: toast.type,
        show: true,
      };

      setToasts((prev) => [...prev, newToast]);

      hideToast();

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    }
  }, [toast, hideToast]);

  useEffect(() => {
    const timeouts = toasts.map((t) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== t.id));
      }, 5000)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [toasts]);

  const getBorderColor = (type) => {
    switch (type) {
      case "success":
        return "#28a745";
      case "error":
        return "#dc3545";
      case "warning":
        return "#ffc107";
      case "info":
        return "#17a2b8";
      default:
        return "#007bff";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "";
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case "success":
        return "نجاح";
      case "error":
        return "خطأ";
      case "warning":
        return "تحذير";
      case "info":
        return "معلومة";
      default:
        return "إشعار";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast show mb-3"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            minWidth: "300px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderLeft: `4px solid ${getBorderColor(t.type)}`,
            overflow: "hidden",
          }}
        >
          <div
            className="toast-header"
            style={{
              borderBottom: "none",
              borderRadius: "8px 8px 0 0",
              padding: "12px 16px",
              backgroundColor: "white",
            }}
          >
            <strong className="me-auto">
              {getIcon(t.type)} {getTitle(t.type)}
            </strong>
            <small className="text-muted">الآن</small>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() =>
                setToasts((prev) => prev.filter((toast) => toast.id !== t.id))
              }
              style={{ filter: "brightness(0.8)" }}
            ></button>
          </div>
          <div
            className="toast-body"
            style={{
              padding: "16px",
              backgroundColor: "white",
              borderRadius: "0 0 8px 8px",
            }}
          >
            {t.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastNotification;
