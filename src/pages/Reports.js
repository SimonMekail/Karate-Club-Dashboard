import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import { API_CONFIG } from "../config";
import BeltDistributionChart from "../components/Charts/BeltDistribution";
import MonthlyRevenueChart from "../components/Charts/MonthlyRevenue";
import NewMembersChart from "../components/Charts/NewMembers";
import PopularClassesChart from "../components/Charts/PopularClasses";
import { motion, AnimatePresence } from "framer-motion";

export const Reports = () => {
  const { user } = AuthData();

  const [dashboardData, setDashboardData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

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
          setDashboardData(response.data);
          setIsLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        setIsLoading(false);
      });
  }, [user.token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        when: "beforeChildren",
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 12,
        mass: 0.5,
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: [0.2, 0.8, 0.3, 1],
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.6,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 10,
      },
    },
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
        <div className="col-10 p-0">
          <NavBar />

          <AnimatePresence>
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="d-flex justify-content-center align-items-center vh-100"
              >
                <Spinner />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4"
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="h3 mb-0"
                    style={{ color: "var(--karate-text)" }}
                  >
                    <i
                      className="fas fa-chart-line me-2"
                      style={{ color: "var(--karate-primary)" }}
                    ></i>
                    تقارير
                  </motion.h1>
                </div>

                <motion.div className="row mb-4" variants={containerVariants}>
                  {}
                  <motion.div
                    className="col-xl-3 col-md-6 mb-4"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <div
                      className="card h-100 border-0 shadow"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <motion.h6
                              className="mb-2 text-uppercase"
                              style={{
                                color: "var(--karate-text-light)",
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              إجمالي الأعضاء
                            </motion.h6>
                            <motion.h3
                              className="mb-2"
                              style={{
                                color: "var(--karate-text)",
                                fontWeight: "700",
                              }}
                              variants={numberVariants}
                            >
                              {dashboardData.general?.totalMembers || 0}
                            </motion.h3>
                            <motion.div
                              className="d-flex align-items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                            >
                              <span
                                className="badge me-2"
                                style={{
                                  backgroundColor:
                                    "rgba(var(--karate-primary-rgb), 0.1)",
                                  color: "var(--karate-primary)",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.general?.activeMembers || 0} نشط
                              </span>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    "rgba(var(--karate-text-light-rgb), 0.1)",
                                  color: "var(--karate-text-light)",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.general?.nonActiveMembers || 0}{" "}
                                غير نشط
                              </span>
                            </motion.div>
                          </div>
                          <motion.div
                            style={{
                              backgroundColor:
                                "rgba(var(--karate-primary-rgb), 0.1)",
                              padding: "12px",
                              borderRadius: "8px",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            variants={iconVariants}
                          >
                            <i
                              className="fas fa-users fa-lg"
                              style={{
                                color: "var(--karate-primary)",
                              }}
                            ></i>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {}
                  <motion.div
                    className="col-xl-3 col-md-6 mb-4"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: 0.1 }}
                  >
                    <div
                      className="card h-100 border-0 shadow"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <motion.h6
                              className="mb-2 text-uppercase"
                              style={{
                                color: "var(--karate-text-light)",
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              معدل الحضور
                            </motion.h6>
                            <motion.h3
                              className="mb-2"
                              style={{
                                color: "var(--karate-text)",
                                fontWeight: "700",
                              }}
                              variants={numberVariants}
                            >
                              {dashboardData.attendanceStats?.[1]?.percentage ||
                                0}
                              %
                            </motion.h3>
                            <motion.div
                              className="d-flex align-items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              <span
                                className="badge me-2"
                                style={{
                                  backgroundColor:
                                    "rgba(var(--karate-primary-rgb), 0.1)",
                                  color: "var(--karate-primary)",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.attendanceStats?.[1]?.count || 0}{" "}
                                حضور
                              </span>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: "rgba(255, 99, 132, 0.1)",
                                  color: "#ff6384",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.attendanceStats?.[0]?.count || 0}{" "}
                                غياب
                              </span>
                            </motion.div>
                          </div>
                          <motion.div
                            style={{
                              backgroundColor:
                                "rgba(var(--karate-primary-rgb), 0.1)",
                              padding: "12px",
                              borderRadius: "8px",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            variants={iconVariants}
                          >
                            <i
                              className="fas fa-calendar-check fa-lg"
                              style={{
                                color: "var(--karate-primary)",
                              }}
                            ></i>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {}
                  <motion.div
                    className="col-xl-3 col-md-6 mb-4"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: 0.2 }}
                  >
                    <div
                      className="card h-100 border-0 shadow"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <motion.h6
                              className="mb-2 text-uppercase"
                              style={{
                                color: "var(--karate-text-light)",
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              إجمالي الأرباح
                            </motion.h6>
                            <motion.h3
                              className="mb-2"
                              style={{
                                color: "var(--karate-text)",
                                fontWeight: "700",
                              }}
                              variants={numberVariants}
                            >
                              {(
                                dashboardData.totalRevenue?.totalRevenue || 0
                              ).toLocaleString()}{" "}
                              ل.س
                            </motion.h3>
                          </div>
                          <motion.div
                            style={{
                              backgroundColor:
                                "rgba(var(--karate-primary-rgb), 0.1)",
                              padding: "12px",
                              borderRadius: "8px",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            variants={iconVariants}
                          >
                            <i
                              className="fas fa-money-bill-wave fa-lg"
                              style={{
                                color: "var(--karate-primary)",
                              }}
                            ></i>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {}
                  <motion.div
                    className="col-xl-3 col-md-6 mb-4"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ delay: 0.3 }}
                  >
                    <div
                      className="card h-100 border-0 shadow"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <motion.h6
                              className="mb-2 text-uppercase"
                              style={{
                                color: "var(--karate-text-light)",
                                fontSize: "0.75rem",
                                letterSpacing: "0.5px",
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              معدل النجاح
                            </motion.h6>
                            <motion.h3
                              className="mb-2"
                              style={{
                                color: "var(--karate-text)",
                                fontWeight: "700",
                              }}
                              variants={numberVariants}
                            >
                              {dashboardData.testSuccessRates?.[1]?.percentage?.toFixed(
                                2
                              ) || 0}
                              %
                            </motion.h3>
                            <motion.div
                              className="d-flex align-items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 }}
                            >
                              <span
                                className="badge me-2"
                                style={{
                                  backgroundColor:
                                    "rgba(var(--karate-primary-rgb), 0.1)",
                                  color: "var(--karate-primary)",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.testSuccessRates?.[1]?.count ||
                                  0}{" "}
                                نجاح
                              </span>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: "rgba(255, 99, 132, 0.1)",
                                  color: "#ff6384",
                                }}
                              >
                                <i
                                  className="fas fa-circle me-1"
                                  style={{ fontSize: "0.5rem" }}
                                ></i>
                                {dashboardData.testSuccessRates?.[0]?.count ||
                                  0}{" "}
                                رسوب
                              </span>
                            </motion.div>
                          </div>
                          <motion.div
                            style={{
                              backgroundColor:
                                "rgba(var(--karate-primary-rgb), 0.1)",
                              padding: "12px",
                              borderRadius: "8px",
                              width: "48px",
                              height: "48px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            variants={iconVariants}
                          >
                            <i
                              className="fas fa-graduation-cap fa-lg"
                              style={{
                                color: "var(--karate-primary)",
                              }}
                            ></i>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {}
                <div className="row mb-4">
                  <motion.div
                    className="col-xl-6 col-lg-12 mb-4"
                    variants={chartVariants}
                  >
                    <div
                      className="card shadow h-100 border-0"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div
                        className="card-header py-3 d-flex flex-row align-items-center justify-content-between"
                        style={{
                          backgroundColor: "var(--karate-card)",
                          borderBottom: "1px solid var(--karate-border)",
                        }}
                      >
                        <h6
                          className="m-0 font-weight-bold"
                          style={{ color: "var(--karate-primary)" }}
                        >
                          الإيرادات الشهرية
                        </h6>
                      </div>
                      <div className="card-body">
                        <MonthlyRevenueChart
                          monthlyRevenue={dashboardData.monthlyRevenue}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="col-xl-6 col-lg-12 mb-4"
                    variants={chartVariants}
                    transition={{ delay: 0.1 }}
                  >
                    <div
                      className="card shadow h-100 border-0"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div
                        className="card-header py-3 d-flex flex-row align-items-center justify-content-between"
                        style={{
                          backgroundColor: "var(--karate-card)",
                          borderBottom: "1px solid var(--karate-border)",
                        }}
                      >
                        <h6
                          className="m-0 font-weight-bold"
                          style={{ color: "var(--karate-primary)" }}
                        >
                          توزيع الأحزمة
                        </h6>
                      </div>
                      <div className="card-body">
                        <BeltDistributionChart
                          beltDistribution={dashboardData.beltDistribution}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {}
                <div className="row">
                  <motion.div
                    className="col-xl-6 col-lg-12 mb-4"
                    variants={chartVariants}
                    transition={{ delay: 0.2 }}
                  >
                    <div
                      className="card shadow h-100 border-0"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div
                        className="card-header py-3 d-flex flex-row align-items-center justify-content-between"
                        style={{
                          backgroundColor: "var(--karate-card)",
                          borderBottom: "1px solid var(--karate-border)",
                        }}
                      >
                        <h6
                          className="m-0 font-weight-bold"
                          style={{ color: "var(--karate-primary)" }}
                        >
                          الاشتراكات الجديدة شهرياً
                        </h6>
                      </div>
                      <div className="card-body">
                        <NewMembersChart
                          newMembersMonthly={dashboardData.newMembersMonthly}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="col-xl-6 col-lg-12 mb-4"
                    variants={chartVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <div
                      className="card shadow h-100 border-0"
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        borderLeft: "4px solid var(--karate-primary)",
                      }}
                    >
                      <div
                        className="card-header py-3 d-flex flex-row align-items-center justify-content-between"
                        style={{
                          backgroundColor: "var(--karate-card)",
                          borderBottom: "1px solid var(--karate-border)",
                        }}
                      >
                        <h6
                          className="m-0 font-weight-bold"
                          style={{ color: "var(--karate-primary)" }}
                        >
                          أكثر الفصول شعبية
                        </h6>
                      </div>
                      <div className="card-body">
                        <PopularClassesChart
                          popularClasses={dashboardData.popularClasses}
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
