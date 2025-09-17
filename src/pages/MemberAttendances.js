import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import AttendancesList from "../components/Attendances/AttendancesList";
import Pagination from "../components/Navigation/Pagination";
import { exportToPDF } from "../utils/exportToPDF";
import { exportToCSV } from "../utils/exportToCSV";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { API_CONFIG } from "../config";

export const MemberAttendances = () => {
  const { user } = AuthData();
  const { member_id } = useParams();

  const [attendances, setAttendances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [memberInfo, setMemberInfo] = useState(null);

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchAttendances(option);
  };

  const fetchAttendances = (filter = "all") => {
    setIsLoading(true);

    let endpoint = "/api/Attendances/All/ByMemberID/" + member_id;

    if (filter === "present") {
      endpoint = `/api/Attendances/All/ByMemberID/Present/${member_id}`;
    } else if (filter === "absent") {
      endpoint = `/api/Attendances/All/ByMemberID/Absent/${member_id}`;
    }

    axios
      .get(endpoint, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          setAttendances(response.data);
          console.log(response);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchMemberInfo = () => {
    axios
      .get(`/api/Members/${member_id}`, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        setMemberInfo({
          memberID: response.data.memberID,
          name: response.data.personInfo.name,
          imagePath: response.data.personInfo.imagePath,
          belt: response.data.beltRank || "لا يوجد",
          isActive: response.data.isActive,
          memberSince: new Date(
            response.data.personInfo.startDate
          ).toLocaleDateString("ar-EG", { year: "numeric", month: "long" }),
        });
      })
      .catch((error) => console.log(error));
  };

  const getBeltColor = (beltRank) => {
    const beltColorMap = {
      "الحزام الأبيض": "beltWhite",
      "الحزام الأصفر": "beltYellow",
      "الحزام البرتقالي": "beltOrange",
      "الحزام الأخضر": "beltGreen",
      "الحزام الأزرق": "beltBlue",
      "الحزام البنفسجي": "beltPurple",
      "الحزام البني": "beltBrown",
      "الحزام الأسود": "beltBlack",
    };

    return beltColorMap[beltRank] || "beltWhite";
  };

  const getSortedAttendances = (attendancesToSort) => {
    const sortedAttendances = [...attendancesToSort];

    switch (sortOption) {
      case "date-asc":
        sortedAttendances.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedAttendances.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "member-asc":
        sortedAttendances.sort((a, b) =>
          a.memberName.localeCompare(b.memberName)
        );
        break;
      case "member-desc":
        sortedAttendances.sort((a, b) =>
          b.memberName.localeCompare(a.memberName)
        );
        break;
      case "belt-asc":
        sortedAttendances.sort((a, b) =>
          a.lastBeltName.localeCompare(b.lastBeltName)
        );
        break;
      case "belt-desc":
        sortedAttendances.sort((a, b) =>
          b.lastBeltName.localeCompare(a.lastBeltName)
        );
        break;
      case "status-asc":
        sortedAttendances.sort((a, b) => a.status - b.status);
        break;
      case "status-desc":
        sortedAttendances.sort((a, b) => b.status - a.status);
        break;
      default:
        break;
    }

    return sortedAttendances;
  };

  const itemPerPage = 10;
  const sortedAttendances = getSortedAttendances(attendances);
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedAttendances.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchAttendances();
    fetchMemberInfo();
  }, [user.token]);

  if (isLoading || !memberInfo) {
    return (
      <div className="container-fluid min-vh-100 backGroundColor">
        <div className="row">
          <div className="col-2 vh-100 sticky-top p-0">
            <SideBar />
          </div>
          <div className="col ps-0">
            <NavBar />
            <div className="d-flex justify-content-center align-items-center vh-100">
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attendancePercentage =
    attendances.length > 0
      ? attendances.filter((a) => a.status).length / attendances.length
      : 0;

  const getAttendanceBadge = () => {
    if (attendancePercentage >= 1) {
      return {
        text: "حضور ممتاز",
        icon: "trophy",
        color: "#FFD700",
      };
    } else if (attendancePercentage >= 0.75) {
      return {
        text: "حضور متميز",
        icon: "medal",
        color: "#C0C0C0",
      };
    } else if (attendancePercentage >= 0.5) {
      return {
        text: "حضور جيد",
        icon: "award",
        color: "#CD7F32",
      };
    } else if (attendancePercentage >= 0.25) {
      return {
        text: "حضور مقبول",
        icon: "star",
        color: "#4CAF50",
      };
    } else {
      return {
        text: "يحتاج تحسين",
        icon: "exclamation-circle",
        color: "#F44336",
      };
    }
  };

  const attendanceBadge = getAttendanceBadge();

  return (
    <div
      style={{
        backgroundColor: "var(--karate-background)",
        minHeight: "100vh",
      }}
      className="container-fluid"
    >
      {}
      <style>
        {`
          .bg-gold {
            background-color: rgba(255, 215, 0, 0.2) !important;
            color: gold !important;
            border: 1px solid gold !important;
          }
          .bg-silver {
            background-color: rgba(192, 192, 192, 0.2) !important;
            color: silver !important;
            border: 1px solid silver !important;
          }
          .bg-bronze {
            background-color: rgba(205, 127, 50, 0.2) !important;
            color: #cd7f32 !important;
            border: 1px solid #cd7f32 !important;
          }
        `}
      </style>

      <div className="row">
        <div className="col-lg-3 col-xl-2 d-none d-lg-block p-0">
          <SideBar />
        </div>
        <div className="col ps-0">
          <NavBar />

          <div className="p-4">
            {}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1" style={{ color: "var(--karate-text)" }}>
                  📝 سجلات حضور العضو
                </h1>
                <p
                  className="mb-0"
                  style={{ color: "var(--karate-text-light)" }}
                >
                  متابعة سجلات حضور العضو في النادي
                </p>
              </div>
              <div className="d-flex align-items-center">
                <div className="d-flex">
                  <button
                    className="btn mx-2"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                    onClick={() =>
                      exportToPDF(
                        sortedAttendances.map((attendance) => ({
                          date: new Date(attendance.date).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          ),
                          belt: attendance.lastBeltName,
                          status: attendance.status ? "حاضر" : "غائب",
                          name: attendance.memberName,
                        })),
                        [
                          { key: "date", label: "التاريخ" },
                          { key: "belt", label: "الحزام" },
                          { key: "status", label: "الحالة" },
                          { key: "name", label: "الاسم" },
                        ],
                        "سجل الحضور"
                      )
                    }
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    تصدير PDF
                  </button>
                  <button
                    className="btn mx-2"
                    style={{
                      backgroundColor: "var(--karate-secondary)",
                      color: "white",
                    }}
                    onClick={() =>
                      exportToCSV(
                        sortedAttendances.map((attendance) => ({
                          date: new Date(attendance.date).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          ),
                          belt: attendance.lastBeltName,
                          status: attendance.status ? "حاضر" : "غائب",
                          name: attendance.memberName,
                        })),
                        [
                          { key: "date", label: "التاريخ" },
                          { key: "belt", label: "الحزام" },
                          { key: "status", label: "الحالة" },
                          { key: "name", label: "الاسم" },
                        ],
                        "سجل_الحضور.csv"
                      )
                    }
                  >
                    <i className="fas fa-file-csv me-2"></i>
                    تصدير CSV
                  </button>
                </div>
              </div>
            </div>

            {}
            <div
              className="card mb-4 border-0 shadow-sm"
              style={{
                backgroundColor: "var(--karate-card)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-center">
                  {}
                  <div className="position-relative me-4">
                    {memberInfo.imagePath ? (
                      <motion.div whileHover={{ scale: 1.03 }}>
                        <img
                          src={memberInfo.imagePath}
                          className="rounded-circle border border-3 border-white shadow"
                          alt={memberInfo.name}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center"
                        style={{
                          width: "100px",
                          height: "100px",
                          border: "3px solid white",
                          background:
                            "linear-gradient(135deg, var(--karate-primary), var(--karate-secondary))",
                        }}
                      >
                        <i className="fas fa-user text-white fs-2"></i>
                      </motion.div>
                    )}
                  </div>

                  {}
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4
                          className="mb-2 fw-bold"
                          style={{ color: "var(--karate-text)" }}
                        >
                          {memberInfo.name}
                        </h4>

                        {}
                        <div className="d-flex align-items-center mb-2">
                          <div className="d-flex align-items-center me-3">
                            <span
                              className={`${getBeltColor(
                                memberInfo.belt
                              )} me-2`}
                              style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                border: "2px solid var(--karate-border)",
                              }}
                            ></span>
                            <span
                              className="fw-medium"
                              style={{ color: "var(--karate-text)" }}
                            >
                              {memberInfo.belt}
                            </span>
                          </div>

                          <span
                            className={`badge rounded-pill px-3 py-1 ${
                              memberInfo.isActive
                                ? "bg-success bg-opacity-10 text-success"
                                : "bg-secondary bg-opacity-10 text-secondary"
                            }`}
                          >
                            <i
                              className={`fas ${
                                memberInfo.isActive
                                  ? "fa-check-circle"
                                  : "fa-times-circle"
                              } me-1`}
                            ></i>
                            {memberInfo.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </div>

                        {}
                        <div className="d-flex align-items-center">
                          <i
                            className="fas fa-calendar-alt me-2"
                            style={{
                              color: "var(--karate-text-light)",
                              opacity: 0.8,
                            }}
                          ></i>
                          <small style={{ color: "var(--karate-text-light)" }}>
                            عضو منذ{" "}
                            <span className="fw-medium">
                              {memberInfo.memberSince}
                            </span>
                          </small>
                        </div>

                        {}
                        <div className="mt-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted">نسبة الحضور</small>
                            <small
                              className="fw-bold"
                              style={{ color: "var(--karate-primary)" }}
                            >
                              {Math.round(attendancePercentage * 100)}%
                            </small>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${attendancePercentage * 100}%`,
                                backgroundColor: "var(--karate-primary)",
                              }}
                              aria-valuenow={attendancePercentage * 100}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>

                          {}
                          {attendances.length > 0 && (
                            <div className="mt-3">
                              <div className="d-flex align-items-center">
                                <span
                                  className="me-2 small"
                                  style={{ color: "var(--karate-text-light)" }}
                                >
                                  مستوى الحضور:
                                </span>
                                <div className="position-relative">
                                  <div
                                    className="badge-container"
                                    style={{
                                      position: "relative",
                                      width: "fit-content",
                                      padding: "0.5rem 1rem",
                                      borderRadius: "50px",
                                      background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                                      boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
                                      border: `1px solid ${attendanceBadge.color}`,
                                      color: attendanceBadge.color,
                                      fontWeight: "600",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.5rem",
                                      zIndex: 1,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        background: `linear-gradient(90deg, ${attendanceBadge.color}20, transparent)`,
                                        zIndex: -1,
                                        opacity: 0.7,
                                      }}
                                    />
                                    <i
                                      className={`fas fa-${attendanceBadge.icon}`}
                                      style={{
                                        fontSize: "1.1rem",
                                        color: attendanceBadge.color,
                                        textShadow: `0 0 8px ${attendanceBadge.color}80`,
                                      }}
                                    />
                                    <span>{attendanceBadge.text}</span>
                                  </div>

                                  {}
                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "-5px",
                                      right: "-5px",
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "50%",
                                      background: attendanceBadge.color,
                                      opacity: 0.3,
                                      filter: "blur(2px)",
                                    }}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: "-5px",
                                      left: "-5px",
                                      width: "15px",
                                      height: "15px",
                                      borderRadius: "50%",
                                      background: attendanceBadge.color,
                                      opacity: 0.2,
                                      filter: "blur(1px)",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {}
                      <div className="text-end">
                        <div className="d-flex flex-column">
                          <div
                            className="mb-3 p-3 rounded-3"
                            style={{
                              backgroundColor: "var(--karate-card-hover)",
                            }}
                          >
                            <div className="text-muted small mb-1">
                              إجمالي سجلات الحضور
                            </div>
                            <div
                              className="h4 mb-0 fw-bold"
                              style={{ color: "var(--karate-primary)" }}
                            >
                              {attendances.length}
                            </div>
                          </div>

                          <div className="d-flex">
                            <div
                              className="me-2 p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">حضور</div>
                              <div className="h5 mb-0 fw-bold text-success">
                                {attendances.filter((a) => a.status).length}
                              </div>
                            </div>

                            <div
                              className="p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">غياب</div>
                              <div className="h5 mb-0 fw-bold text-secondary">
                                {attendances.filter((a) => !a.status).length}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="filterControls">
                  <button
                    className={`filterBtn ${
                      filterOption === "all" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("all")}
                  >
                    الكل
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "present" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("present")}
                  >
                    الحضور
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "absent" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("absent")}
                  >
                    الغياب
                  </button>
                </div>
                <div className="rightControls">
                  <div className="d-flex align-items-center me-3">
                    <span
                      className="me-2"
                      style={{ color: "var(--karate-text-light)" }}
                    >
                      ترتيب:
                    </span>
                    <select
                      className="form-select form-select-sm"
                      value={sortOption}
                      onChange={(e) => handleSort(e.target.value)}
                      style={{
                        backgroundColor: "var(--karate-card)",
                        borderColor: "var(--karate-border)",
                        color: "var(--karate-text)",
                      }}
                    >
                      <option value="date-desc">التاريخ (الأحدث)</option>
                      <option value="date-asc">التاريخ (الأقدم)</option>
                      <option value="member-asc">الاسم (أ-ي)</option>
                      <option value="member-desc">الاسم (ي-أ)</option>
                      <option value="belt-asc">الحزام (أ-ي)</option>
                      <option value="belt-desc">الحزام (ي-أ)</option>
                      <option value="status-desc">الحالة (حاضر أولاً)</option>
                      <option value="status-asc">الحالة (غائب أولاً)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <AttendancesList
              attendances={pageItems}
              fetchAttendances={() => fetchAttendances(filterOption)}
            />

            {sortedAttendances.length > itemPerPage && (
              <div className="mt-4">
                <Pagination
                  itemPerPage={itemPerPage}
                  totalItems={sortedAttendances.length}
                  handlePageClick={handlePageClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
