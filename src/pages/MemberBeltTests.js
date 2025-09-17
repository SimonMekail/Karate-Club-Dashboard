import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import BeltTestsList from "../components/BeltTests/BeltTestsList";
import Pagination from "../components/Navigation/Pagination";
import { exportToPDF } from "../utils/exportToPDF";
import { exportToCSV } from "../utils/exportToCSV";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { API_CONFIG } from "../config";

export const MemberBeltTests = () => {
  const { user } = AuthData();
  const { member_id } = useParams();

  const [beltTests, setBeltTests] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [beltRanks, setBeltRanks] = useState([]);
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
    fetchBeltTests(option);
  };

  const fetchBeltTests = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/BeltTests/All/ByMemberID/" + member_id;

    if (filter === "passed") {
      endpoint = "/api/BeltTests/All/ByMemberID/Success/" + member_id;
    } else if (filter === "failed") {
      endpoint = "/api/BeltTests/All/ByMemberID/Failed/" + member_id;
    }

    axios
      .get("/api/Trainers/All/Active", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
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
        if (response.request.status === 200) {
          setBeltRanks(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    axios
      .get(endpoint, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          setBeltTests(response.data);
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

  const getSortedBeltTests = (testsToSort) => {
    const sortedTests = [...testsToSort];

    switch (sortOption) {
      case "date-asc":
        sortedTests.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedTests.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "member-asc":
        sortedTests.sort((a, b) => a.memberName.localeCompare(b.memberName));
        break;
      case "member-desc":
        sortedTests.sort((a, b) => b.memberName.localeCompare(a.memberName));
        break;
      case "belt-asc":
        sortedTests.sort((a, b) => a.beltName.localeCompare(b.beltName));
        break;
      case "belt-desc":
        sortedTests.sort((a, b) => b.beltName.localeCompare(a.beltName));
        break;
      default:
        break;
    }

    return sortedTests;
  };

  const itemPerPage = 10;
  const sortedBeltTests = getSortedBeltTests(beltTests);
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedBeltTests.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchBeltTests(filterOption);
    fetchMemberInfo();
  }, [user.token, member_id]);

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

          <div className="p-4">
            {}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1" style={{ color: "var(--karate-text)" }}>
                  🥋 اختبارات حزام العضو
                </h1>
                <p
                  className="mb-0"
                  style={{ color: "var(--karate-text-light)" }}
                >
                  متابعة اختبارات حزام العضو في النادي
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
                        sortedBeltTests.map((test) => ({
                          date: new Date(test.date).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          ),
                          belt: test.beltName,
                          result: test.result ? "ناجح" : "غير ناجح",
                          trainer: test.trainerName,
                        })),
                        [
                          { key: "date", label: "التاريخ" },
                          { key: "belt", label: "الحزام" },
                          { key: "result", label: "النتيجة" },
                          { key: "trainer", label: "المدرب" },
                        ],
                        "سجل اختبارات الحزام"
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
                        sortedBeltTests.map((test) => ({
                          date: new Date(test.date).toLocaleDateString(
                            "ar-EG",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          ),
                          belt: test.beltName,
                          result: test.result ? "ناجح" : "غير ناجح",
                          trainer: test.trainerName,
                        })),
                        [
                          { key: "date", label: "التاريخ" },
                          { key: "belt", label: "الحزام" },
                          { key: "result", label: "النتيجة" },
                          { key: "trainer", label: "المدرب" },
                        ],
                        "سجل_اختبارات_الحزام.csv"
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
                            <small className="text-muted">نسبة النجاح</small>
                            <small
                              className="fw-bold"
                              style={{ color: "var(--karate-primary)" }}
                            >
                              {beltTests.length > 0
                                ? Math.round(
                                    (beltTests.filter((test) => test.result)
                                      .length /
                                      beltTests.length) *
                                      100
                                  ) + "%"
                                : "0%"}
                            </small>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{
                                width: `${
                                  beltTests.length > 0
                                    ? (beltTests.filter((test) => test.result)
                                        .length /
                                        beltTests.length) *
                                      100
                                    : 0
                                }%`,
                                backgroundColor: "var(--karate-primary)",
                              }}
                              aria-valuenow={
                                beltTests.length > 0
                                  ? (beltTests.filter((test) => test.result)
                                      .length /
                                      beltTests.length) *
                                    100
                                  : 0
                              }
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
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
                              إجمالي الاختبارات
                            </div>
                            <div
                              className="h4 mb-0 fw-bold"
                              style={{ color: "var(--karate-primary)" }}
                            >
                              {beltTests.length}
                            </div>
                          </div>

                          <div className="d-flex">
                            <div
                              className="me-2 p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">ناجحة</div>
                              <div className="h5 mb-0 fw-bold text-success">
                                {beltTests.filter((test) => test.result).length}
                              </div>
                            </div>

                            <div
                              className="p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">
                                غير ناجحة
                              </div>
                              <div className="h5 mb-0 fw-bold text-secondary">
                                {
                                  beltTests.filter((test) => !test.result)
                                    .length
                                }
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
                    <i className="fas fa-list me-1"></i> الكل
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "passed" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("passed")}
                  >
                    <i className="fas fa-check-circle me-1"></i> ناجح
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "failed" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("failed")}
                  >
                    <i className="fas fa-times-circle me-1"></i> غير ناجح
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
                      <option value="member-asc">اسم العضو (أ-ي)</option>
                      <option value="member-desc">اسم العضو (ي-أ)</option>
                      <option value="belt-asc">الحزام (منخفض-عالي)</option>
                      <option value="belt-desc">الحزام (عالي-منخفض)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <BeltTestsList
              beltTests={pageItems}
              fetchBeltTests={fetchBeltTests}
              trainers={trainers}
              beltRanks={beltRanks}
            />

            {sortedBeltTests.length > itemPerPage && (
              <div className="mt-4">
                <Pagination
                  itemPerPage={itemPerPage}
                  totalItems={sortedBeltTests.length}
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
