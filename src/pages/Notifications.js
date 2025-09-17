import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import { API_CONFIG } from "../config";
import { motion } from "framer-motion";

export const Notifications = () => {
  const { user } = AuthData();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    setNotifications([]);

    const fetchNotifications = async () => {
      try {
        const [sessionsResponse, subscriptionsResponse] = await Promise.all([
          axios.get("/api/Statistics/TodaySessions", {
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              ...API_CONFIG.AUTH_HEADERS(user.token),
            },
          }),
          axios.get("/api/Statistics/ExpiredSubscriptionsToday", {
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              ...API_CONFIG.AUTH_HEADERS(user.token),
            },
          }),
        ]);

        const sessionNotifications = sessionsResponse.data.map((session) => ({
          id: `session-${session.sessionID}`,
          icon: "clock",
          name: "جلسة اليوم",
          message: `جلسة ${session.className} تبدأ من ${session.startTime} إلى ${session.endTime}`,
          time: new Date(session.date).toLocaleDateString("ar-EG"),
          read: false,
          type: "session",
        }));

        const subscriptionNotifications = subscriptionsResponse.data.map(
          (sub) => ({
            id: `subscription-${sub.subscriptionID}`,
            icon: "exclamation-triangle",
            name: "انتهاء الاشتراك",
            message: `اشتراك ${sub.memberName} في ${sub.className} ينتهي اليوم`,
            time: new Date(sub.endDate).toLocaleDateString("ar-EG"),
            read: false,
            type: "subscription",
          })
        );

        const allNotifications = [
          ...sessionNotifications,
          ...subscriptionNotifications,
        ];

        setNotifications(allNotifications);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user.token]);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{
        backgroundColor: "var(--karate-background)",
        minHeight: "100vh",
      }}
      className="container-fluid"
    >
      <div className="row">
        <div className="col-lg-3 col-xl-2 d-none d-lg-block p-0">
          <SideBar />
        </div>
        <div className="col ps-0">
          <NavBar />

          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center vh-100">
              <Spinner />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="p-4"
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0" style={{ color: "var(--karate-text)" }}>
                  <i
                    className="fas fa-bell me-2"
                    style={{ color: "var(--karate-primary)" }}
                  ></i>
                  اشعارات اليوم
                  {unreadCount > 0 && (
                    <span
                      className="notification-count ms-2"
                      style={{
                        backgroundColor: "var(--karate-accent)",
                        color: "white",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </h1>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read btn btn-sm"
                    onClick={markAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--karate-primary)",
                      fontWeight: "500",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    <i className="fas fa-check-circle me-1"></i> تعيين الكل
                    كمقروء
                  </button>
                )}
              </div>

              <div
                className="notification-container rounded-3 overflow-hidden"
                style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  background: "var(--karate-card)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                }}
              >
                {notifications.length === 0 ? (
                  <div
                    className="empty-state p-5 text-center"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    <i
                      className="far fa-bell"
                      style={{ fontSize: "3rem", opacity: "0.5" }}
                    ></i>
                    <h4
                      className="mt-3"
                      style={{ color: "var(--karate-text)" }}
                    >
                      لا توجد إشعارات
                    </h4>
                    <p>عندما تتلقى إشعارات، ستظهر هنا</p>
                  </div>
                ) : (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item d-flex align-items-start p-3 border-bottom ${
                          !notification.read ? "unread" : ""
                        }`}
                        style={{
                          borderColor: "var(--karate-border)",
                          cursor: "pointer",
                          backgroundColor: !notification.read
                            ? "rgba(var(--karate-primary-rgb), 0.05)"
                            : "transparent",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div
                          className={`notification-icon bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center ${
                            notification.type === "subscription"
                              ? "text-warning"
                              : "text-info"
                          }`}
                          style={{
                            width: "48px",
                            height: "48px",
                            flexShrink: "0",
                          }}
                        >
                          <i className={`fas fa-${notification.icon}`}></i>
                        </div>

                        <div className="notification-content flex-grow-1">
                          <p
                            className="notification-message mb-1"
                            style={{ lineHeight: "1.5" }}
                          >
                            <strong style={{ color: "var(--karate-text)" }}>
                              {notification.name}
                            </strong>{" "}
                            {notification.message}
                          </p>
                          <div
                            className="notification-time d-flex align-items-center"
                            style={{
                              color: "var(--karate-text-light)",
                              fontSize: "0.875rem",
                            }}
                          >
                            <i
                              className="far fa-clock me-1"
                              style={{ fontSize: "0.75rem" }}
                            ></i>
                            {notification.time}
                            {!notification.read && (
                              <span
                                className="notification-dot ms-2"
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "var(--karate-primary)",
                                  borderRadius: "50%",
                                  flexShrink: "0",
                                }}
                              ></span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
