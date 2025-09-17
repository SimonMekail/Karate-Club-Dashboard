
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import toast from "react-hot-toast";

const MessageContainer = ({ isMessageOpen, setIsMessageOpen }) => {
  const [userMessages, setUserMessages] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState(new Map());
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [userMessages, adminMessages]);

  useEffect(() => {
    let count = 0;
    activeUsers.forEach((user) => {
      if (user.unread) {
        count++;
      }
    });
    setUnreadCount(count);
  }, [activeUsers]);

  
  useEffect(() => {
    const newSocket = io("http:
    setSocket(newSocket);

    
    newSocket.emit("register", { type: "admin" });

    
    newSocket.on("new-message", (data) => {
      const userId = data.from;
      const username = `مستخدم ${userId.slice(-4)}`;
      const isNewConversation = !conversations.has(userId);

      
      if (isNewConversation && (!isMessageOpen || selectedUser !== userId)) {
        toast.success(
          <div>
            <div style={{ fontWeight: "bold" }}>رسالة جديدة</div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              لديك رسالة جديدة من مستخدم
            </div>
          </div>,
          {
            duration: 4000,
            position: "top-center",
            icon: "💬",
            style: {
              background: "var(--karate-card)",
              color: "#5a6a7e",
            },
          }
        );
      }

      setActiveUsers((prev) => {
        const newUsers = new Map(prev);
        if (!newUsers.has(userId)) {
          newUsers.set(userId, {
            id: userId,
            username: username,
            unread: true,
          });
        } else {
          const user = newUsers.get(userId);
          newUsers.set(userId, {
            ...user,
            unread: true,
          });
        }
        return newUsers;
      });

      setConversations((prev) => {
        const newConvs = new Map(prev);
        if (!newConvs.has(userId)) {
          newConvs.set(userId, []);
        }
        newConvs.get(userId).push({
          id: Date.now(),
          text: data.message,
          sender: "user",
          timestamp: new Date(data.timestamp),
        });
        return newConvs;
      });

      if (selectedUser === userId && isMessageOpen) {
        setUserMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.message,
            sender: "user",
            userId: userId,
            timestamp: new Date(data.timestamp),
          },
        ]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isMessageOpen, selectedUser, conversations]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !selectedUser) return;

    socket.emit("admin-response", {
      to: selectedUser,
      message: newMessage,
    });

    setConversations((prev) => {
      const newConvs = new Map(prev);
      if (!newConvs.has(selectedUser)) {
        newConvs.set(selectedUser, []);
      }
      newConvs.get(selectedUser).push({
        id: Date.now(),
        text: newMessage,
        sender: "admin",
        timestamp: new Date(),
      });
      return newConvs;
    });

    setAdminMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newMessage,
        sender: "admin",
        userId: selectedUser,
        timestamp: new Date(),
      },
    ]);

    setNewMessage("");
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);

    setActiveUsers((prev) => {
      const newUsers = new Map(prev);
      if (newUsers.has(userId)) {
        newUsers.set(userId, {
          ...newUsers.get(userId),
          unread: false,
        });
      }
      return newUsers;
    });

    if (conversations.has(userId)) {
      const userConv = conversations
        .get(userId)
        .filter((msg) => msg.sender === "user");
      const adminConv = conversations
        .get(userId)
        .filter((msg) => msg.sender === "admin");

      setUserMessages(userConv);
      setAdminMessages(adminConv);
    } else {
      setUserMessages([]);
      setAdminMessages([]);
    }
  };

  
  const handleRemoveUser = (userId, e) => {
    e.stopPropagation(); 

    setActiveUsers((prev) => {
      const newUsers = new Map(prev);
      newUsers.delete(userId);
      return newUsers;
    });

    setConversations((prev) => {
      const newConvs = new Map(prev);
      newConvs.delete(userId);
      return newConvs;
    });

    
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUserMessages([]);
      setAdminMessages([]);
    }
  };

  const getAllMessages = () => {
    if (!selectedUser) return [];

    const allMessages = [
      ...userMessages.map((msg) => ({ ...msg, type: "received" })),
      ...adminMessages.map((msg) => ({ ...msg, type: "sent" })),
    ];

    return allMessages.sort((a, b) => a.timestamp - b.timestamp);
  };

  return (
    <motion.div
      className="position-fixed"
      style={{
        bottom: "20px",
        left: "20px",
        zIndex: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      {!isMessageOpen ? (
        <div className="position-relative">
          <motion.button
            className="btn btn-lg rounded-circle shadow position-relative"
            style={{
              backgroundColor: "#5fc1c9",
              color: "white",
              width: "60px",
              height: "60px",
            }}
            onClick={() => setIsMessageOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-comments" style={{ fontSize: "24px" }}></i>
            {unreadCount > 0 && (
              <motion.span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{
                  backgroundColor: "#fc5185",
                  color: "white",
                  fontSize: "0.6rem",
                  minWidth: "18px",
                  height: "15px",
                  transform: "translate(-30%, -30%)",
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="card shadow"
          style={{
            width: "400px",
            maxHeight: "600px",
            borderRadius: "15px",
            overflow: "hidden",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <div
            className="d-flex justify-content-between align-items-center p-3"
            style={{
              backgroundColor: "#364f8b",
              color: "white",
            }}
          >
            <div className="d-flex align-items-center">
              <i
                className="fas fa-comments me-2"
                style={{ fontSize: "20px" }}
              ></i>
              <h6 className="mb-0">مراسلة النادي (المشرف)</h6>
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-2">
                  {unreadCount} غير مقروء
                </span>
              )}
            </div>
            <button
              className="btn btn-sm p-0"
              style={{ color: "white" }}
              onClick={() => setIsMessageOpen(false)}
            >
              <i className="fas fa-times" style={{ fontSize: "18px" }}></i>
            </button>
          </div>

          <div
            className="p-2 border-bottom"
            style={{
              backgroundColor: "#e9ecef",
              maxHeight: "120px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="small fw-bold">المستخدمين النشطين:</span>

              {Array.from(activeUsers.values()).map((user) => (
                <motion.div
                  key={user.id}
                  className="position-relative d-inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    className={`btn btn-sm position-relative ${
                      selectedUser === user.id ? "active" : ""
                    }`}
                    style={{
                      backgroundColor:
                        selectedUser === user.id ? "#5fc1c9" : "#f8f9fa",
                      color: selectedUser === user.id ? "white" : "black",
                      whiteSpace: "nowrap",
                      paddingRight: "10px",
                    }}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    {user.username}
                    {user.unread && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"
                        style={{
                          backgroundColor: "#fc5185",
                          borderColor: "white",
                        }}
                      >
                        <span className="visually-hidden">رسائل جديدة</span>
                      </span>
                    )}
                  </button>
                  <button
                    className="btn btn-sm p-0 position-absolute"
                    style={{
                      top: "-4px",
                      right: "-4px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: "#6c757d",
                      color: "white",
                      fontSize: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={(e) => handleRemoveUser(user.id, e)}
                    title="إزالة المستخدم"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </motion.div>
              ))}

              {activeUsers.size === 0 && (
                <span className="small text-muted">لا يوجد مستخدمين نشطين</span>
              )}
            </div>
          </div>

          <div
            className="p-3"
            style={{
              height: "300px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            {!selectedUser ? (
              <div className="text-center text-muted py-5">
                <i className="fas fa-comments fs-1 mb-3"></i>
                <p>اختر مستخدمًا لبدء المحادثة</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {getAllMessages().map((message) => (
                  <motion.div
                    key={message.id}
                    className={`d-flex ${
                      message.sender === "admin"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`p-3 rounded ${
                        message.sender === "admin"
                          ? "text-white"
                          : "bg-white border"
                      }`}
                      style={{
                        maxWidth: "80%",
                        ...(message.sender === "admin"
                          ? {
                              backgroundColor: "#5fc1c9",
                            }
                          : {}),
                      }}
                    >
                      <div className="message-text">{message.text}</div>
                      <div
                        className="message-time small mt-1 opacity-75"
                        style={{
                          textAlign:
                            message.sender === "admin" ? "left" : "right",
                          fontSize: "0.7rem",
                        }}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isSending && (
                  <motion.div
                    className="d-flex justify-content-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div
                      className="p-3 rounded"
                      style={{
                        backgroundColor: "#5fc1c9",
                        color: "white",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          style={{ width: "1rem", height: "1rem" }}
                        >
                          <span className="visually-hidden">
                            جاري الارسال...
                          </span>
                        </div>
                        <span>جاري الارسال...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div
            className="p-3 border-top"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="input-group">
              <textarea
                className="form-control"
                placeholder={
                  selectedUser ? "اكتب رسالتك هنا..." : "اختر مستخدمًا أولاً"
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!selectedUser}
                style={{
                  resize: "none",
                  minHeight: "40px",
                  maxHeight: "100px",
                }}
              />
              <motion.button
                className="btn"
                style={{
                  backgroundColor: selectedUser ? "#5fc1c9" : "#cccccc",
                  color: "white",
                }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending || !selectedUser}
                whileHover={{ scale: selectedUser ? 1.05 : 1 }}
                whileTap={{ scale: selectedUser ? 0.95 : 1 }}
              >
                <i className="fas fa-paper-plane"></i>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageContainer;
