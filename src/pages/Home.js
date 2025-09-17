import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import Cards from "../components/Cards/Cards";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import PromotionRatesChart from "../components/Charts/PromotionRates";
import { API_CONFIG } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { generateClubOverview } from "../utils/generateClubOverviewReport";
import { AddMemberModal } from "../components/Modals/AddMemberModal";
import { AddTrainerModal } from "../components/Modals/AddTrainerModal";
import { AddKarateClassModal } from "../components/Modals/AddKarateClassModal";
import { QRCodeScannerSessionAttendances } from "../components/Modals/QRCodeScannerSessionAttendances";
import MessageContainer from "../components/MessageContainer/MessageContainer";

export const Home = () => {
  const { user } = AuthData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [beltRanks, setBeltRanks] = useState([]);

  useEffect(() => {
    setIsLoading(true);

    const fetchData = async () => {
      axios
        .get("/api/Members/All/Active", {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        })
        .then((response) => {
          console.log(response);
          if (response.request.status === 200) {
            setRecentMembers(response.data.slice(-4));
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      axios
        .get("/api/Sessions/All", {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            const today = new Date().toLocaleDateString();

            const todaysSessions = response.data.filter((session) => {
              const sessionDate = new Date(session.date).toLocaleDateString();
              return sessionDate === today;
            });

            setRecentSessions(todaysSessions);
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      axios
        .get("/api/Trainers/All/Active", {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            setTrainers(response.data);
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      axios
        .get("/api/BeltRanks/All", {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        })
        .then((response) => {
          console.log(response);
          if (response.request.status === 200) {
            setBeltRanks(response.data);
          }
        })
        .catch(function (error) {
          console.log(error);
        });

      axios
        .get("/api/Statistics/All", {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...API_CONFIG.AUTH_HEADERS(user.token),
          },
        })
        .then((response) => {
          console.log(response);
          if (response.request.status === 200) {
            setStats(response.data);
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchData();
  }, [user.token]);

  const handleAddMember = () => {
    setShowMemberModal(true);
  };

  const handleAddKarateClass = () => {
    setShowClassModal(true);
  };

  const handleAddTrainer = () => {
    setShowTrainerModal(true);
  };

  const handlePrintOverview = () => {
    generateClubOverview(stats);
  };

  const quickActions = [
    {
      title: "إضافة عضو جديد",
      icon: "fas fa-user-plus",
      action: handleAddMember,
      color: "var(--karate-primary)",
      hoverColor: "var(--karate-primary-dark)",
    },
    {
      title: "إضافة مدرب",
      icon: "fas fa-user-plus",
      action: handleAddTrainer,
      color: "var(--karate-primary)",
      hoverColor: "var(--karate-primary-dark)",
    },
    {
      title: "إضافة صف تدريب",
      icon: "fas fa-user-ninja",
      action: handleAddKarateClass,
      color: "var(--karate-accent)",
      hoverColor: "var(--karate-accent-dark)",
    },

    {
      title: "طباعة تقرير النادي",
      icon: "fas fa-print",
      action: handlePrintOverview,
      color: "var(--karate-secondary)",
      hoverColor: "var(--karate-secondary-dark)",
    },
  ];

  const formatArabicDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("ar-EG", options);
  };

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

        {}
        <div className="col ps-0">
          <NavBar />
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <Spinner />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="px-3 px-md-4"
            >
              {}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center  pt-4">
                <div className=" mb-md-0">
                  <h1
                    className="mb-1"
                    style={{
                      color: "var(--karate-text)",
                      fontWeight: 600,
                      fontSize: "1.5rem",
                    }}
                  >
                    مرحباً بعودتك!
                  </h1>
                  <p
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--karate-text-light)",
                    }}
                  >
                    نظرة عامة على أنشطة النادي
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    to="/BeltRanks"
                    className="btn"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    <i className="fas fa-layer-group me-1"></i> الأحزمة
                  </Link>
                  <Link
                    to="/KarateClasses"
                    className="btn"
                    style={{
                      backgroundColor: "var(--karate-accent)",
                      color: "white",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    <i className="fas fa-user-ninja me-1"></i> صفوف التدريب
                  </Link>
                </div>
              </div>
              {}
              <div className="row mb-4">
                <Cards
                  activeMembers={stats.general.activeMembers}
                  monthlyRevenue={
                    stats.monthlyRevenue.slice(-1)[0].monthlyRevenue
                  }
                  newMembersMonthly={
                    stats.newMembersMonthly.slice(-1)[0].newSubscription
                  }
                  mostPopularClass={
                    stats.popularClasses.reduce((prev, current) =>
                      prev.totalSubscriptions > current.totalSubscriptions
                        ? prev
                        : current
                    ).className
                  }
                />
              </div>
              {}
              <div className="row g-4">
                {}
                <div className="col-lg-8 order-2 order-lg-1">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card shadow-sm h-100"
                    style={{
                      backgroundColor: "var(--karate-card)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  >
                    <div className="card-body p-3 p-md-4">
                      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
                        <h5
                          className="mb-0"
                          style={{
                            color: "var(--karate-text)",
                            fontWeight: 600,
                            fontSize: "1.1rem",
                          }}
                        >
                          <i
                            className="fas fa-chart-line me-2"
                            style={{ color: "var(--karate-accent)" }}
                          ></i>
                          معدلات النجاح
                        </h5>
                      </div>
                      <div style={{ height: "300px", minHeight: "300px" }}>
                        <PromotionRatesChart
                          promotionRates={stats.promotionRates}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {}
                <div className="col-lg-4 order-1 order-lg-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="card shadow-sm h-100"
                    style={{
                      backgroundColor: "var(--karate-card)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  >
                    <div className="card-body p-3 p-md-4">
                      <h5
                        className="mb-3 mb-md-4"
                        style={{
                          color: "var(--karate-text)",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        <i
                          className="fas fa-bolt me-2"
                          style={{ color: "var(--karate-accent)" }}
                        ></i>
                        إجراءات سريعة
                      </h5>
                      <div className="row g-2 g-md-3">
                        {quickActions.map((action, index) => (
                          <div
                            key={index}
                            className="col-12 col-sm-6 col-lg-12"
                          >
                            <motion.div
                              whileHover={{ y: -3 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <button
                                onClick={action.action}
                                className="btn w-100 py-2 py-md-3 d-flex align-items-center"
                                style={{
                                  backgroundColor: action.color,
                                  color: "white",
                                  borderRadius: "8px",
                                  transition: "all 0.3s ease",
                                  border: "none",
                                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                  justifyContent: "flex-start",
                                  paddingLeft: "1rem",
                                  paddingRight: "1rem",
                                  fontSize: "0.875rem",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    action.hoverColor)
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    action.color)
                                }
                              >
                                <i
                                  className={`${action.icon} fs-5 me-2 me-md-3`}
                                ></i>
                                <span
                                  className="fw-medium"
                                  style={{ fontSize: "0.9rem" }}
                                >
                                  {action.title}
                                </span>
                              </button>
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              {}
              <div className="row mt-4 g-4">
                {}
                <div className="col-lg-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--karate-card)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  >
                    <div className="card-body p-3 p-md-4">
                      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
                        <h5
                          className="mb-0"
                          style={{
                            color: "var(--karate-text)",
                            fontWeight: 600,
                            fontSize: "1.1rem",
                          }}
                        >
                          <i
                            className="fas fa-history me-2"
                            style={{ color: "var(--karate-accent)" }}
                          ></i>
                          النشاط الأخير
                        </h5>
                        <Link
                          to="/members"
                          className="btn btn-sm"
                          style={{
                            color: "var(--karate-primary)",
                            backgroundColor:
                              "rgba(var(--karate-primary-rgb), 0.1)",
                            borderRadius: "6px",
                          }}
                        >
                          عرض الكل
                        </Link>
                      </div>
                      <div className="activity-list">
                        {recentMembers.map((member) => (
                          <div
                            key={member.memberID}
                            className="activity-item d-flex align-items-center py-2 py-md-3 border-bottom"
                            style={{
                              borderColor: "var(--karate-border) !important",
                            }}
                          >
                            <div className="flex-shrink-0 me-2 me-md-3">
                              {member.personInfo.imagePath ? (
                                <motion.img
                                  whileHover={{ scale: 1.05 }}
                                  src={member.personInfo.imagePath}
                                  className="rounded-circle border border-2 shadow-sm"
                                  alt={member.personInfo.name}
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    objectFit: "cover",
                                    backgroundColor: "var(--karate-card)",
                                    borderColor:
                                      "var(--karate-border) !important",
                                  }}
                                />
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  className="profile-img no-image rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    border: "2px solid var(--karate-border)",
                                    boxShadow:
                                      "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
                                    color: "var(--karate-text-light)",
                                    backgroundColor: "var(--karate-background)",
                                  }}
                                >
                                  <i className="fas fa-user fs-6"></i>
                                </motion.div>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6
                                  className="mb-0"
                                  style={{
                                    color: "var(--karate-text)",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span>
                                    عضو جديد:{" "}
                                    <strong>{member.personInfo.name}</strong> -{" "}
                                    {member.beltRank}
                                  </span>
                                </h6>
                                <small
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--karate-text-light)",
                                  }}
                                >
                                  {new Date(
                                    member.personInfo.startDate
                                  ).toLocaleTimeString("ar-EG", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </div>
                              <small
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--karate-text-light)",
                                }}
                              >
                                {formatArabicDate(member.personInfo.startDate)}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {}
                <div className="col-lg-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="card shadow-sm"
                    style={{
                      backgroundColor: "var(--karate-card)",
                      borderRadius: "12px",
                      border: "none",
                    }}
                  >
                    <div className="card-body p-3 p-md-4">
                      <h5
                        className="mb-3 mb-md-4"
                        style={{
                          color: "var(--karate-text)",
                          fontWeight: 600,
                          fontSize: "1.1rem",
                        }}
                      >
                        <i
                          className="fas fa-calendar-alt me-2"
                          style={{ color: "var(--karate-accent)" }}
                        ></i>
                        الجلسات القادمة
                      </h5>
                      {recentSessions.length > 0 ? (
                        <div className="events-list">
                          {recentSessions.map((session) => (
                            <div
                              key={session.sessionID}
                              className="mb-2 mb-md-3 p-2 p-md-3 rounded"
                              style={{
                                backgroundColor: "var(--karate-background)",
                              }}
                            >
                              <div className="d-flex justify-content-between mb-1">
                                <h4
                                  className="m-0 h6 fw-bold"
                                  style={{
                                    color: "var(--karate-text)",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  {session.classInfo.name}
                                </h4>
                                <small
                                  style={{
                                    color: "var(--karate-primary)",
                                    fontWeight: "500",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {formatArabicDate(session.date)}
                                </small>
                              </div>
                              <small
                                className="d-block mb-1 mb-md-2"
                                style={{
                                  color: "var(--karate-text-light)",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {session.startTime} - {session.endTime}
                              </small>

                              {}
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <span
                                  className="badge"
                                  style={{
                                    backgroundColor:
                                      "var(--karate-secondary-light)",
                                    color: "var(--karate-secondary-dark)",
                                    fontWeight: "500",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  {session.classInfo.currentEnrollment} مشارك
                                </span>

                                <QRCodeScannerSessionAttendances
                                  sessionID={session.sessionID}
                                />
                              </div>
                            </div>
                          ))}
                          <div className="text-center mt-2 mt-md-3">
                            <Link
                              to="/sessions"
                              className="btn btn-sm"
                              style={{
                                color: "var(--karate-primary)",
                                backgroundColor:
                                  "rgba(var(--karate-primary-rgb), 0.1)",
                                borderRadius: "6px",
                              }}
                            >
                              عرض التقويم الكامل
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 py-md-5">
                          <i
                            className="fas fa-calendar-day fs-1 mb-2 mb-md-3"
                            style={{ color: "var(--karate-text-light)" }}
                          ></i>
                          <p
                            className="mb-3"
                            style={{
                              fontSize: "0.9rem",
                              color: "var(--karate-text-light)",
                            }}
                          >
                            لا توجد أحداث قادمة في الوقت الحالي
                          </p>
                          <Link
                            to="/sessions"
                            className="btn btn-sm"
                            style={{
                              color: "var(--karate-primary)",
                              backgroundColor:
                                "rgba(var(--karate-primary-rgb), 0.1)",
                              borderRadius: "6px",
                            }}
                          >
                            عرض التقويم
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <AddMemberModal
        show={showMemberModal}
        onHide={() => setShowMemberModal(false)}
        beltRanks={beltRanks}
      />
      <AddTrainerModal
        show={showTrainerModal}
        onHide={() => setShowTrainerModal(false)}
      />
      <AddKarateClassModal
        show={showClassModal}
        onHide={() => setShowClassModal(false)}
        trainers={trainers}
      />
      {/* 
      <MessageContainer
        isMessageOpen={isMessageOpen}
        setIsMessageOpen={setIsMessageOpen}
      /> */}
    </div>
  );
};
