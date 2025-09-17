import React from "react";
import { useState, useEffect, useRef } from "react";
import karateImage from "../assests/images/pexels-artempodrez-6253307.jpg";
import axios from "axios";
import { API_CONFIG } from "../config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client"; // Socket.IO client

// Fix for default marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const formatDate = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-eg", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "-";
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const slideInFromLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
};

const slideInFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const hoverEffect = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

const tapEffect = {
  scale: 0.98,
};

// Message Component - Updated to use Socket.IO
// Message Component - Updated to use Socket.IO
const MessageContainer = ({ isMessageOpen, setIsMessageOpen }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [adminOnline, setAdminOnline] = useState(false); // New state for admin status
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isMessageOpen) {
      // Initialize Socket.IO connection
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);

      // Register as user
      newSocket.emit("register", { type: "user" });

      // Listen for responses from admins
      newSocket.on("response", (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: data.message,
            sender: "admin",
            timestamp: new Date(data.timestamp),
          },
        ]);
      });

      // Listen for admin status updates
      newSocket.on("admin-status", (status) => {
        setAdminOnline(status === "online");

        // Add system message when admin status changes
        if (messages.length > 0) {
          // Only show if chat has been used
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              text:
                status === "online"
                  ? "المسؤول متصل الآن. يمكنك التواصل مباشرة."
                  : "المسؤول غير متصل حالياً. سوف نرد عليك عند عودته.",
              sender: "system",
              timestamp: new Date(),
            },
          ]);
        }
      });

      // Clean up on component unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [isMessageOpen]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    // Send message to admins
    socket.emit("user-message", newMessage);

    // Add user message to local state
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Add appropriate response message based on admin status
    const responseMessage = {
      id: Date.now() + 1,
      text: adminOnline
        ? "تم إرسال رسالتك إلى المسؤول."
        : "شكراً على رسالتك. سوف نرد عليك في أقرب وقت ممكن.",
      sender: "system",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, responseMessage]);
    setNewMessage("");
    setIsSending(true);

    // Clear sending state after a delay
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
          {/* Online status indicator */}
          {/* <span
            className={`position-absolute top-0 start-0 translate-middle p-1 border border-white rounded-circle ${
              adminOnline ? "bg-success" : "bg-secondary"
            }`}
            style={{ fontSize: "0.5rem" }}
          ></span> */}
        </motion.button>
      ) : (
        <motion.div
          className="card shadow"
          style={{
            width: "350px",
            maxHeight: "500px",
            borderRadius: "15px",
            overflow: "hidden",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Message header with admin status */}
          <div
            className="d-flex justify-content-between align-items-center p-3 position-relative"
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
              <h6 className="mb-0">مراسلة النادي</h6>
            </div>
            <div className="d-flex align-items-center">
              {/* Admin status indicator */}
              <div className="d-flex align-items-center me-3">
                <span
                  className={`me-1 p-1 rounded-circle ${
                    adminOnline ? "bg-success" : "bg-secondary"
                  }`}
                  style={{ fontSize: "0.5rem" }}
                ></span>
                <small>{adminOnline ? "المشرف متصل" : "المشرف غير متصل"}</small>
              </div>
              <button
                className="btn btn-sm p-0"
                style={{ color: "white" }}
                onClick={() => setIsMessageOpen(false)}
              >
                <i className="fas fa-times" style={{ fontSize: "18px" }}></i>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="p-3"
            style={{
              height: "300px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div className="d-flex flex-column gap-2">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`d-flex ${
                    message.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`p-3 rounded ${
                      message.sender === "user"
                        ? "text-white"
                        : message.sender === "system"
                        ? "bg-light text-dark border"
                        : "bg-white border"
                    }`}
                    style={{
                      maxWidth: "80%",
                      ...(message.sender === "user"
                        ? {
                            backgroundColor: "#5fc1c9",
                          }
                        : message.sender === "system"
                        ? {
                            backgroundColor: "#e9ecef",
                            fontStyle: "italic",
                          }
                        : {}),
                    }}
                  >
                    <div className="message-text">{message.text}</div>
                    <div
                      className="message-time small mt-1 opacity-75"
                      style={{
                        textAlign: message.sender === "user" ? "left" : "right",
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
                    style={{ backgroundColor: "#5fc1c9", color: "white" }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        style={{ width: "1rem", height: "1rem" }}
                      >
                        <span className="visually-hidden">جاري الارسال...</span>
                      </div>
                      <span>جاري الارسال...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <div
            className="p-3 border-top"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <div className="input-group">
              <textarea
                className="form-control"
                placeholder="اكتب رسالتك هنا..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  resize: "none",
                  minHeight: "40px",
                  maxHeight: "100px",
                }}
              />
              <motion.button
                className="btn"
                style={{
                  backgroundColor: "#5fc1c9",
                  color: "white",
                }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
// Chatbot component with predefined choices (unchanged from your original)
const ChatBot = ({ isChatOpen, setIsChatOpen }) => {
  const [messages, setMessages] = useState([]);
  const [chatState, setChatState] = useState("initial");
  const [selectedTestType, setSelectedTestType] = useState(null);

  const beltTips = [
    "ركز على الجودة وليس سرعة التقدم - التميز في الأساسيات أهم من الحصول على الحزام بسرعة",
    "الانتظام في الحضور هو مفتاح التحسن - حتى لو كانت التدريبات قصيرة، المداومة أهم من الكمية",
    "الممارسة خارج وقت الدرس تسرع التقدم - خصص 15 دقيقة يومياً للتدرب في المنزل",
    "كل حزام يبني على المعرفة السابقة - لا تتجاهل تقنيات الأحزمة السابقة عند التقدم",
    "التغذية الجيدة تساعد في الأداء - اهتم بطعامك كما تهتم بتدريباتك",
    "الراحة جزء من التدريب - أعط جسمك وقتاً كافياً للتعافي بين الجلسات",
    "سجل تقدمك في دفتر ملاحظات - كتابة الملاحظات تساعد في تثبيت المعلومة",
    "تعلم من زملائك الأكثر تقدماً - مراقبة الآخرين طريقة رائعة للتحسن",
    "كن صبوراً مع نفسك - التقدم في الكاراتيه رحلة وليس سباقاً",
    "استمع جيداً لتعليمات المدرب - التفاصيل الصغيرة تحدث فرقاً كبيراً",
  ];

  const quickReplies = {
    initial: [
      { text: "الفصول والتدريبات", action: "classes" },
      { text: "المدربون", action: "trainers" },
      { text: "نتائج الاختبارات", action: "tests" },
      { text: "الجدول الزمني", action: "schedule" },
      { text: "معلومات الاتصال", action: "contact" },
      { text: "معلومات الاختبارات", action: "test_info" },
      { text: "نصائح لتقدم الأحزمة", action: "belt_tips" },
    ],
    tests: [
      { text: "نتائج اختبارات الطلاب", action: "member_tests" },
      { text: "نتائج اختبارات المدربين", action: "trainer_tests" },
      { text: "العودة", action: "initial" },
    ],
    classes: [
      { text: "الفصول للمبتدئين", action: "beginner_classes" },
      { text: "الفصول المتقدمة", action: "advanced_classes" },
      { text: "فصول الأطفال", action: "kids_classes" },
      { text: "العودة", action: "initial" },
    ],
  };

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: "مرحباً بك في نادي الكاراتيه! كيف يمكنني مساعدتك اليوم؟",
        sender: "bot",
      };
      setMessages([welcomeMessage]);
      setChatState("initial");
    }
  }, [isChatOpen]);

  const handleQuickReply = (action) => {
    const userMessage = {
      id: Date.now(),
      text: quickReplies[chatState].find((item) => item.action === action).text,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);

    switch (action) {
      case "classes":
        setChatState("classes");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "لدينا عدة أنواع من الفصول. اختر أحد الخيارات التالية:",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "trainers":
        setChatState("trainers");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "لدينا فريق من المدربين المحترفين. يمكنك الاطلاع على معلومات المدربين في قسم 'المدربون' في الموقع.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "tests":
        setChatState("tests");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "يمكنك الاطلاع على نتائج الاختبارات. اختر نوع الاختبارات التي تريد الاطلاع عليها:",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "member_tests":
        setSelectedTestType("member");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "للعثور على نتائج اختبارات الطلاب، يرجى زيارة صفحة 'نتائج الاختبارات' وإدخال رقم الطالب.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "trainer_tests":
        setSelectedTestType("trainer");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "للعثور على نتائج اختبارات المدربين، يرجى زيارة صفحة 'نتائج الاختبارات' وإدخال رقم المدرب.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "schedule":
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "يمكنك الاطلاع على الجدول الزمني للفصول في قسم 'الجدول الزمني' في الموقع.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "contact":
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "معلومات الاتصال متاحة في قسم 'تواصل معنا' في أسفل الصفحة. يمكنك العثور على العنوان ورقم الهاتف وساعات العمل.",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "initial":
        setChatState("initial");
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: "كيف يمكنني مساعدتك؟",
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "test_info":
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            text: `معلومات الاختبار:
      
• يتم الاختبار من 2-4 مرات في السنة
• تشمل الرسوم الحزام والشهادة وتكاليف الممتحن
• يتطلب الاختبار توصية من مدربك
• قد يمتد اختبار الحزام الأسود لعدة أيام`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      case "belt_tips":
        setTimeout(() => {
          const randomTip =
            beltTips[Math.floor(Math.random() * beltTips.length)];
          const botMessage = {
            id: Date.now() + 1,
            text: `💡 نصيحة لتقدم الأحزمة:\n\n${randomTip}`,
            sender: "bot",
          };
          setMessages((prev) => [...prev, botMessage]);
        }, 500);
        break;

      default:
        if (action.includes("_classes")) {
          setTimeout(() => {
            const classType = action.split("_")[0];
            const classNames = {
              beginner: "الفصول للمبتدئين",
              advanced: "الفصول المتقدمة",
              kids: "فصول الأطفال",
            };

            const botMessage = {
              id: Date.now() + 1,
              text: `يمكنك الاطلاع على ${classNames[classType]} في قسم 'الفصول' في الموقع. لدينا جلسات متعددة خلال الأسبوع تناسب جميع المستويات.`,
              sender: "bot",
            };
            setMessages((prev) => [...prev, botMessage]);
          }, 500);
        }
        break;
    }
  };

  return (
    <motion.div
      className="position-fixed"
      style={{
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      {!isChatOpen ? (
        <motion.button
          className="btn btn-lg rounded-circle shadow"
          style={{
            backgroundColor: "#fc5185",
            color: "white",
            width: "60px",
            height: "60px",
          }}
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="fas fa-robot" style={{ fontSize: "24px" }}></i>
        </motion.button>
      ) : (
        <motion.div
          className="card shadow"
          style={{
            width: "350px",
            maxHeight: "500px",
            borderRadius: "15px",
            overflow: "hidden",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          {/* Chat header */}
          <div
            className="d-flex justify-content-between align-items-center p-3"
            style={{
              backgroundColor: "#364f8b",
              color: "white",
            }}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-robot me-2" style={{ fontSize: "20px" }}></i>
              <h6 className="mb-0">مساعد نادي الكاراتيه</h6>
            </div>
            <button
              className="btn btn-sm p-0"
              style={{ color: "white" }}
              onClick={() => setIsChatOpen(false)}
            >
              <i className="fas fa-times" style={{ fontSize: "18px" }}></i>
            </button>
          </div>

          {/* Chat messages */}
          <div
            className="p-3"
            style={{
              height: "300px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            <div className="d-flex flex-column gap-2">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`d-flex ${
                    message.sender === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className={`p-3 rounded ${
                      message.sender === "user"
                        ? "text-white"
                        : "bg-white border"
                    }`}
                    style={{
                      maxWidth: "80%",
                      ...(message.sender === "user"
                        ? {
                            backgroundColor: "#fc5185",
                          }
                        : {}),
                    }}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick replies */}
          <div
            className="p-3 border-top"
            style={{
              backgroundColor: "#f8f9fa",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            <div className="d-flex flex-wrap gap-2">
              {quickReplies[chatState]?.map((reply, index) => (
                <motion.button
                  key={index}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#5fc1c9",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => handleQuickReply(reply.action)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reply.text}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export const WebSite = () => {
  const [trainers, setTrainers] = useState([]);
  const [trainerTests, setTrainerTests] = useState([]);
  const [memberTests, setMemberTests] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [memberID, setMemberID] = useState("");
  const [trainerID, setTrainerID] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const [testType, setTestType] = useState("member");

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("/api/Trainers/All/Active", {
        headers: {
          Accept: API_CONFIG.DEFAULT_HEADERS,
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          const allTrainers = response.data;
          const lastThreeTrainers = allTrainers.slice(-3);
          setTrainers(lastThreeTrainers);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get("/api/Classes/All", {
        headers: {
          Accept: API_CONFIG.DEFAULT_HEADERS,
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          const allClasses = response.data;
          const lastThreeClasses = allClasses.slice(-3);
          setKarateClasses(lastThreeClasses);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get("/api/Sessions/All", {
        headers: {
          Accept: API_CONFIG.DEFAULT_HEADERS,
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          const today = new Date().toLocaleDateString(); // Get today's date in local format

          // Filter sessions to only include those with today's date
          const todaysSessions = response.data.filter((session) => {
            // Adjust this based on how your session date is formatted
            const sessionDate = new Date(session.date).toLocaleDateString();
            return sessionDate === today;
          });

          //  setRecentSessions(todaysSessions.slice(-3)); // Get last 3 of today's sessions
          setSessions(todaysSessions); // Get last 3 of today's sessions
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCheckTests = () => {
    if (testType === "member" && !memberID.trim()) {
      setTestError("الرجاء إدخال رقم الطالب");
      return;
    }

    if (testType === "trainer" && !trainerID.trim()) {
      setTestError("الرجاء إدخال رقم المدرب");
      return;
    }

    setTestLoading(true);
    setTestError("");
    setMemberTests([]);
    setTrainerTests([]);

    const endpoint =
      testType === "member"
        ? `/api/BeltTests/All/ByMemberID/${memberID}`
        : `/api/BeltTests/All/ByTrainerID/${trainerID}`;

    axios
      .get(endpoint, {
        headers: {
          Accept: API_CONFIG.DEFAULT_HEADERS,
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          if (testType === "member") {
            setMemberTests(response.data);
          } else {
            setTrainerTests(response.data);
          }
        }
      })
      .catch(function (error) {
        console.log(error);
        setTestError(
          testType === "member"
            ? "لم يتم العثور على نتائج اختبارات لهذا الطالب"
            : "لم يتم العثور على نتائج اختبارات لهذا المدرب"
        );
      })
      .finally(() => {
        setTestLoading(false);
      });
  };

  const handleDragonDoubleClick = () => {
    setShowEasterEgg(true);
    setTimeout(() => setShowEasterEgg(false), 3000); // Hide after 3 seconds
  };

  const styles = {
    heroSection: {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${karateImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: "white",
      padding: "120px 0",
      textAlign: "center",
    },
    sectionTitle: {
      position: "relative",
      marginBottom: "40px",
      paddingBottom: "15px",
    },
    sectionTitleAfter: {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "80px",
      height: "3px",
      backgroundColor: "#fc5185",
    },
    classCardImg: {
      height: "200px",
      objectFit: "cover",
    },
    instructorImg: {
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "5px solid #364f8b",
      marginBottom: "15px",
    },
    testimonialCard: {
      backgroundColor: "#f5f7fa",
      padding: "30px",
      borderRadius: "5px",
      marginBottom: "20px",
    },
    primaryBg: {
      backgroundColor: "#364f8b",
    },
    secondaryBg: {
      backgroundColor: "#5fc1c9",
    },
    accentBg: {
      backgroundColor: "#fc5185",
    },
  };

  return (
    <div className="overflow-hidden">
      {isLoading ? (
        <motion.div
          className="d-flex justify-content-center align-items-center vh-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="spinner-border text-primary"
            role="status"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <span className="visually-hidden">Loading...</span>
          </motion.div>
        </motion.div>
      ) : (
        <>
          {/* Navigation */}
          <motion.nav
            className="navbar navbar-expand-lg navbar-dark sticky-top"
            style={styles.primaryBg}
          >
            <div className="container">
              <motion.a
                className="navbar-brand fw-bold d-flex align-items-center"
                href="#"
                whileHover={{ scale: 1.05 }}
                onDoubleClick={handleDragonDoubleClick}
              >
                <i className="fas fa-dragon me-2"></i> نادي الكاراتية
              </motion.a>
              <button
                className="navbar-toggler"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div
                className={`collapse navbar-collapse ${
                  isMenuOpen ? "show" : ""
                }`}
              >
                <motion.ul
                  className="navbar-nav ms-auto"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {["classes", "instructors", "schedule", "tests"].map(
                    (item, index) => (
                      <motion.li
                        className="nav-item"
                        key={item}
                        variants={itemVariants}
                      >
                        <a
                          className="nav-link text-white fw-medium"
                          href={`#${item}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item === "classes" && "الفصول"}
                          {item === "instructors" && "المدربون"}
                          {item === "schedule" && "الجدول الزمني"}
                          {item === "tests" && "نتائج الاختبارات"}
                        </a>
                      </motion.li>
                    )
                  )}
                </motion.ul>
              </div>
            </div>
          </motion.nav>
          {/* Hero Section */}
          <motion.section
            id="home"
            style={styles.heroSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="container py-5">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="display-4 display-md-3 fw-bold mb-4">
                  أتقن فن الكاراتيه
                </h1>
                <p className="lead mb-5">
                  انضم إلى فصول الكاراتيه المحترفة لدينا و درب عقلك وجسدك وروحك
                </p>
              </motion.div>

              <motion.div
                className="d-flex flex-column flex-sm-row justify-content-center gap-3"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <motion.a
                  href="#classes"
                  className="btn btn-lg px-4 mb-2 mb-sm-0"
                  style={{ ...styles.accentBg, color: "white" }}
                  whileHover={hoverEffect}
                  whileTap={tapEffect}
                >
                  فصولنا
                </motion.a>
                <motion.a
                  href="#tests"
                  className="btn btn-lg px-4"
                  style={{ ...styles.secondaryBg, color: "white" }}
                  whileHover={hoverEffect}
                  whileTap={tapEffect}
                >
                  نتائج الاختبارات
                </motion.a>
              </motion.div>
            </div>
          </motion.section>
          {/* About Section */}
          <motion.section
            className="py-5"
            style={{ backgroundColor: "#f5f7fa" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              <div className="row align-items-center">
                <motion.div
                  className="col-lg-6 mb-4 mb-lg-0 order-lg-1"
                  variants={slideInFromLeft}
                >
                  <h2 style={styles.sectionTitle} className="text-center">
                    عن نادينا<span style={styles.sectionTitleAfter}></span>
                  </h2>
                  <p className="lead">
                    يقدم نادي الكاراتيه فنون الدفاع عن النفس التقليدية بأساليب
                    تعليم حديثة منذ عام 1995.
                  </p>
                  <p>
                    نادينا مخصص لمساعدة الطلاب من جميع الأعمار على تطوير
                    الانضباط والثقة واللياقة البدنية من خلال ممارسة الكاراتيه.
                    نتبع أسلوب الشوتوكان مع تأثيرات من فنون الدفاع عن النفس
                    الأخرى لتوفير تجربة شاملة.
                  </p>
                  <p>
                    سواء كنت تبحث عن مهارات الدفاع عن النفس أو تدريب المنافسة أو
                    مجرد تمرين رائع، لدينا برنامج يلبي احتياجاتك.
                  </p>
                </motion.div>
                <motion.div
                  className="col-lg-6 order-lg-0"
                  variants={slideInFromRight}
                >
                  <motion.img
                    src={karateImage}
                    alt="فصل الكاراتيه في الجلسة"
                    className="img-fluid rounded shadow"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.section>
          {/* Tests Section */}
          <motion.section
            className="py-5"
            style={{ backgroundColor: "#f5f7fa" }}
            id="tests"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              <motion.div variants={fadeIn}>
                <h2 style={styles.sectionTitle} className="text-center">
                  نتائج الاختبارات<span style={styles.sectionTitleAfter}></span>
                </h2>
                <p className="text-center mb-5">
                  يمكنك الاطلاع على نتائج اختبارات الطلاب أو المدربين
                </p>
              </motion.div>

              <div className="row justify-content-center">
                <div className="col-md-10 col-lg-8">
                  <motion.div className="card shadow" variants={scaleUp}>
                    <div className="card-body p-3 p-md-4">
                      <motion.div variants={itemVariants}>
                        <label htmlFor="testType" className="form-label">
                          نوع الاختبار
                        </label>
                        <select
                          className="form-select mb-3"
                          id="testType"
                          value={testType}
                          onChange={(e) => setTestType(e.target.value)}
                        >
                          <option value="member">اختبارات الطلاب</option>
                          <option value="trainer">اختبارات المدربين</option>
                        </select>

                        {testType === "member" ? (
                          <>
                            <label htmlFor="studentId" className="form-label">
                              رقم الطالب
                            </label>
                            <input
                              type="text"
                              className="form-control mb-3"
                              id="studentId"
                              value={memberID}
                              onChange={(e) => setMemberID(e.target.value)}
                              placeholder="أدخل رقم الطالب"
                            />
                          </>
                        ) : (
                          <>
                            <label htmlFor="trainerId" className="form-label">
                              رقم المدرب
                            </label>
                            <input
                              type="text"
                              className="form-control mb-3"
                              id="trainerId"
                              value={trainerID}
                              onChange={(e) => setTrainerID(e.target.value)}
                              placeholder="أدخل رقم المدرب"
                            />
                          </>
                        )}

                        <motion.button
                          className="btn w-100"
                          style={{ ...styles.primaryBg, color: "white" }}
                          onClick={handleCheckTests}
                          disabled={testLoading}
                          whileHover={hoverEffect}
                          whileTap={tapEffect}
                        >
                          {testLoading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "عرض النتائج"
                          )}
                        </motion.button>
                        {testError && (
                          <motion.div
                            className="text-danger mt-2 text-center"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            {testError}
                          </motion.div>
                        )}
                      </motion.div>

                      <AnimatePresence>
                        {(memberTests.length > 0 ||
                          trainerTests.length > 0) && (
                          <motion.div
                            className="mt-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h4 className="mb-3 text-center">
                              {testType === "member"
                                ? "نتائج اختبارات الطالب"
                                : "نتائج اختبارات المدرب"}
                            </h4>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead
                                  style={{
                                    ...styles.primaryBg,
                                    color: "white",
                                  }}
                                >
                                  <tr>
                                    <th>اسم الاختبار</th>
                                    <th>التاريخ</th>
                                    <th>النتيجة</th>
                                    {testType === "trainer" && (
                                      <th>اسم الطالب</th>
                                    )}
                                    {testType === "member" && (
                                      <th>اسم المدرب</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(testType === "member"
                                    ? memberTests
                                    : trainerTests
                                  ).map((test) => (
                                    <motion.tr
                                      key={test.testID}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <td>
                                        {"اختبار " + test.beltName ||
                                          "اختبار الكاراتيه"}
                                      </td>
                                      <td>
                                        {new Date(test.date).toLocaleDateString(
                                          "ar-EG"
                                        ) || "-"}
                                      </td>
                                      <td>
                                        {test.result ? "ناجح" : "راسب" || "-"}
                                      </td>
                                      {testType === "member" && (
                                        <td>{test.trainerName || "-"}</td>
                                      )}
                                      {testType === "trainer" && (
                                        <td>{test.memberName || "-"}</td>
                                      )}
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
          {/* Classes Section */}
          <motion.section
            className="py-5"
            id="classes"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              <motion.div variants={fadeIn}>
                <h2 style={styles.sectionTitle} className="text-center">
                  فصولنا<span style={styles.sectionTitleAfter}></span>
                </h2>
                <p className="text-center mb-5">
                  نقدم برامج لجميع الأعمار ومستويات المهارة
                </p>
              </motion.div>

              <motion.div className="row g-4" variants={containerVariants}>
                {karateClasses.map((karateClass) => (
                  <motion.div
                    className="col-12 col-md-6 col-lg-4"
                    key={karateClass.classID}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                  >
                    <div className="card h-100 border-0 shadow">
                      <motion.img
                        src={
                          karateClass.imageUrl ||
                          "https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                        }
                        className="card-img-top"
                        alt={karateClass.name}
                        style={styles.classCardImg}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="card-body">
                        <h4 className="card-title">{karateClass.name}</h4>
                        <p className="card-text">
                          {karateClass.description ||
                            "فصل الكاراتيه لجميع المستويات."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
          {/* Instructors Section */}
          <motion.section
            className="py-5"
            style={{ backgroundColor: "#f5f7fa" }}
            id="instructors"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              <motion.div variants={fadeIn}>
                <h2 style={styles.sectionTitle} className="text-center">
                  قابل مدربينا<span style={styles.sectionTitleAfter}></span>
                </h2>
                <p className="text-center mb-5">تعلم من الأفضل في المجال</p>
              </motion.div>

              <motion.div
                className="row g-4 justify-content-center"
                variants={containerVariants}
              >
                {trainers.map((trainer, index) => (
                  <motion.div
                    className="col-12 col-sm-6 col-md-4 d-flex justify-content-center"
                    key={trainer.trainerID}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center">
                      <motion.div
                        className="profile-img no-image rounded-circle bg-secondary mx-auto d-flex align-items-center justify-content-center"
                        style={{
                          width: "150px",
                          height: "150px",
                        }}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <i className="fas fa-user text-white fs-1"></i>
                      </motion.div>
                      <h4 className="mt-3">{trainer.personInfo.name}</h4>
                      <p className="mb-0">
                        {"مدرب محترف مع سنوات من الخبرة في تعليم الكاراتيه."}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.section>
          {/* Schedule Section */}
          <motion.section
            className="py-5"
            id="schedule"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              <motion.div variants={fadeIn}>
                <h2 style={styles.sectionTitle} className="text-center">
                  جدول الفصول اليومية
                  <span style={styles.sectionTitleAfter}></span>
                </h2>
                <p className="text-center mb-5">ابحث عن الوقت المخصص لتدريبك</p>
              </motion.div>

              <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                  {sessions.length === 0 ? (
                    <motion.div
                      className="text-center p-5 shadow rounded"
                      variants={scaleUp}
                      style={{ backgroundColor: "#f8f9fa" }}
                    >
                      <i
                        className="fas fa-calendar-times display-4 mb-3"
                        style={{ color: "#5fc1c9" }}
                      ></i>
                      <h4 className="mb-3">لا توجد فصول اليوم</h4>
                      <p className="text-muted">
                        لا توجد جلسات تدريبية مجدولة لهذا اليوم.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="table-responsive shadow"
                      variants={scaleUp}
                    >
                      <table className="table table-hover">
                        <thead style={{ ...styles.primaryBg, color: "white" }}>
                          <tr>
                            <th className="text-nowrap">الفصل</th>
                            <th className="text-nowrap">التاريخ</th>
                            <th className="text-nowrap">الوقت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessions.map((session) => (
                            <motion.tr
                              key={session.sessionID}
                              whileHover={{
                                backgroundColor: "rgba(95, 193, 201, 0.1)",
                              }}
                            >
                              <td className="text-nowrap">
                                {session.classInfo.name}
                              </td>
                              <td className="text-nowrap">
                                {formatDate(session.date)}
                              </td>
                              <td className="text-nowrap">
                                {session.startTime || "-"}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
          {/* Contact Section */}
          <motion.section
            className="py-5 bg-light"
            id="contact"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container py-5">
              {/* Location */}
              <div className="row mb-5">
                <div className="col-12">
                  <motion.h3 className="mb-4 text-center" variants={fadeIn}>
                    موقعنا
                  </motion.h3>
                  <motion.div
                    style={{
                      height: "300px",
                      width: "100%",
                      marginBottom: "1rem",
                    }}
                    variants={scaleUp}
                  >
                    <MapContainer
                      center={[33.5102, 36.2913]}
                      zoom={17}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[33.5102, 36.2913]}>
                        <Popup>
                          <b>موقعنا </b>
                          <br />
                          <br />
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </motion.div>

                  <motion.div
                    className="row text-center"
                    variants={containerVariants}
                  >
                    {[
                      {
                        icon: <i className="fas fa-map-marker-alt"></i>,
                        title: "العنوان",
                        text: "123 طريق فنون الدفاع عن النفس",
                      },
                      {
                        icon: <i className="fas fa-clock"></i>,
                        title: "ساعات العمل",
                        text: "من الإثنين إلى الجمعة: 3مساءً-9مساءً\nالسبت: 9صباحاً-3مساءً",
                      },
                      {
                        icon: <i className="fas fa-phone"></i>,
                        title: "الهاتف",
                        text: "+966 12 345 6789",
                      },
                      {
                        icon: <i className="fas fa-envelope"></i>,
                        title: "البريد الإلكتروني",
                        text: "info@karate-club.com",
                      },
                    ].map((item, index) => (
                      <motion.div
                        className="col-6 col-md-3 mb-4"
                        key={index}
                        variants={itemVariants}
                      >
                        <h5>
                          <span
                            className="me-2"
                            style={{ color: styles.primaryBg.backgroundColor }}
                          >
                            {item.icon}
                          </span>
                          {item.title}
                        </h5>
                        <p className="small" style={{ whiteSpace: "pre-line" }}>
                          {item.text}
                        </p>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.section>
          {/* Footer */}
          <motion.footer
            className="pt-5 pb-3"
            style={styles.primaryBg}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="container">
              <div className="row text-white">
                <motion.div
                  className="col-lg-4 mb-4"
                  variants={slideInFromLeft}
                >
                  <h4>
                    <i className="fas fa-dragon me-2"></i> نادي الكاراتية
                  </h4>
                  <p className="small">
                    فنون الدفاع عن النفس التقليدية بأساليب تعليم حديثة. بناء
                    الثقة والانضباط واللياقة منذ عام 1995.
                  </p>
                  <div className="d-flex justify-content-center justify-content-lg-start">
                    {[
                      { icon: <i className="fab fa-facebook-f"></i> },
                      { icon: <i className="fab fa-instagram"></i> },
                      { icon: <i className="fab fa-twitter"></i> },
                      { icon: <i className="fab fa-youtube"></i> },
                    ].map((item, index) => (
                      <motion.a
                        href="#"
                        className="text-white me-3"
                        key={index}
                        whileHover={{ y: -3, color: "#fc5185" }}
                      >
                        {item.icon}
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
                <motion.div
                  className="col-6 col-md-3 col-lg-2 mb-4"
                  variants={slideInFromRight}
                >
                  <h5>روابط سريعة</h5>
                  <ul className="list-unstyled">
                    {[
                      { text: "الرئيسية", href: "#home" },
                      { text: "الفصول", href: "#classes" },
                      { text: "المدربون", href: "#instructors" },
                      { text: "تواصل معنا", href: "#contact" },
                    ].map((item, index) => (
                      <motion.li
                        className="mb-2"
                        key={index}
                        whileHover={{ x: 5 }}
                      >
                        <a
                          href={item.href}
                          className="text-white text-decoration-none small"
                        >
                          {item.text}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              <motion.hr
                className="my-3 bg-light"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <div className="text-center text-white">
                <p className="mb-0 small">
                  &copy; {new Date().getFullYear()} نادي الكاراتية. جميع الحقوق
                  محفوظة.
                </p>
              </div>
            </div>
          </motion.footer>
          <AnimatePresence>
            {showEasterEgg && (
              <motion.div
                className="fixed-top vh-100 vw-100 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  zIndex: 9999,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEasterEgg(false)}
              >
                <motion.div
                  className="text-center text-white p-5"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.5 }}
                >
                  <motion.i
                    className="fas fa-dragon display-1 mb-4"
                    style={{ color: "#fc5185" }}
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <h2 className="mb-3">أسرار الكاراتيه!</h2>
                  <p className="lead">القوة الحقيقية تأتي من الداخل</p>
                  <p>انقر في أي مكان للإغلاق</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Container */}
          <MessageContainer
            isMessageOpen={isMessageOpen}
            setIsMessageOpen={setIsMessageOpen}
          />
          {/* Chatbot */}
          <ChatBot isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
        </>
      )}
    </div>
  );
};
