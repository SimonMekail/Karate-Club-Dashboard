import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import BeltTestsList from "../components/BeltTests/BeltTestsList";
import BeltTestsCalendarView from "../components/BeltTests/BeltTestsListCalenderView";
import Pagination from "../components/Navigation/Pagination";
import { API_CONFIG } from "../config";
import { useSearch } from "../components/Search/Search";
import SearchBar from "../components/Search/SearchBar";
import { motion } from "framer-motion";

export const BeltTests = () => {
  const { user } = AuthData();

  const [beltTests, setBeltTests] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [beltRanks, setBeltRanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    passRate: 0,
    upcoming: 0,
  });

  const searchOptions = [
    { value: "memberName", label: "اسم العضو" },
    { value: "trainerName", label: "اسم المدرب" },
    { value: "beltName", label: "اسم الحزام" },
  ];

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(
      beltTests,
      ["memberName", "trainerName", "beltName"],
      "memberName"
    );

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

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const calculateStats = (tests) => {
    const total = tests.length;
    const passed = tests.filter((test) => test.result).length;
    const failed = tests.filter((test) => !test.result).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = tests.filter((test) => {
      const testDate = new Date(test.date);
      testDate.setHours(0, 0, 0, 0);
      return testDate >= today && test.result === "Scheduled";
    }).length;

    return {
      total,
      passed,
      failed,
      passRate,
      upcoming,
    };
  };

  const fetchBeltTests = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/BeltTests/All";

    if (filter === "passed") {
      endpoint = "/api/BeltTests/All/Success";
    } else if (filter === "failed") {
      endpoint = "/api/BeltTests/All/Failed";
    }

    axios
      .get("/api/Trainers/All/Active", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
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
        console.log(response);
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
        console.log(response);
        if (response.request.status === 200) {
          const testsData = response.data;
          setBeltTests(testsData);
          setStats(calculateStats(testsData));
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  const itemPerPage = viewMode === "table" ? 10 : 8;
  const sortedBeltTests = getSortedBeltTests(
    keyWord.length ? searchResult : beltTests
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedBeltTests.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchBeltTests(filterOption);
  }, [user.token]);

  const statCardStyle = {
    background: "var(--karate-card)",
    borderRadius: "12px",
    border: "1px solid var(--karate-border)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
  };

  const statIconStyle = (type) => {
    const baseStyle = {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 15px",
      fontSize: "1.2rem",
    };

    const typeStyles = {
      "total-tests": {
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        color: "#4f46e5",
      },
      passed: { backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
      failed: { backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
      rate: { backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" },
      upcoming: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        color: "#3b82f6",
      },
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const statNumberStyle = {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
    color: "var(--karate-text)",
  };

  const statLabelStyle = {
    fontSize: "0.9rem",
    color: "var(--karate-text-light)",
    marginBottom: "0",
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
        <div className="col ps-0">
          <NavBar />

          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center vh-100">
              <Spinner />
            </div>
          ) : (
            <div className="p-4">
              {}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1
                    className="h3 mb-1"
                    style={{ color: "var(--karate-text)" }}
                  >
                    🥋 اختبارات الحزام
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع اختبارات ترقية الحزام للأعضاء
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث عن اختبار..."
                      searchOptions={searchOptions}
                      selectedOption={selectedField}
                      setSelectedOption={setSelectedField}
                    />
                  </div>
                  {/* <button
                    className="btn"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة اختبار جديد
                  </button> */}
                </div>
              </div>

              {}
              <div className="row mb-4 justify-content-around">
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                  <motion.div
                    className="card"
                    style={statCardStyle}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="card-body text-center">
                      <div style={statIconStyle("total-tests")}>
                        <i className="fas fa-clipboard-list"></i>
                      </div>
                      <h3 style={statNumberStyle}>{stats.total}</h3>
                      <p style={statLabelStyle}>إجمالي الاختبارات</p>
                    </div>
                  </motion.div>
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                  <motion.div
                    className="card"
                    style={statCardStyle}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <div className="card-body text-center">
                      <div style={statIconStyle("passed")}>
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <h3 style={statNumberStyle}>{stats.passed}</h3>
                      <p style={statLabelStyle}>ناجح</p>
                    </div>
                  </motion.div>
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                  <motion.div
                    className="card"
                    style={statCardStyle}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="card-body text-center">
                      <div style={statIconStyle("failed")}>
                        <i className="fas fa-times-circle"></i>
                      </div>
                      <h3 style={statNumberStyle}>{stats.failed}</h3>
                      <p style={statLabelStyle}>غير ناجح</p>
                    </div>
                  </motion.div>
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                  <motion.div
                    className="card"
                    style={statCardStyle}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <div className="card-body text-center">
                      <div style={statIconStyle("rate")}>
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <h3 style={statNumberStyle}>{stats.passRate}%</h3>
                      <p style={statLabelStyle}>معدل النجاح</p>
                    </div>
                  </motion.div>
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                  <motion.div
                    className="card"
                    style={statCardStyle}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <div className="card-body text-center">
                      <div style={statIconStyle("upcoming")}>
                        <i className="fas fa-calendar-day"></i>
                      </div>
                      <h3 style={statNumberStyle}>{stats.upcoming}</h3>
                      <p style={statLabelStyle}>قادم</p>
                    </div>
                  </motion.div>
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
                    {viewMode === "table" ? (
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
                          <option value="belt-asc">الحزام (منخفض-عالي)</option>
                          <option value="belt-desc">الحزام (عالي-منخفض)</option>
                        </select>
                      </div>
                    ) : null}
                    <div className="actionButtons">
                      <button
                        className={`actionBtn ${
                          viewMode === "table" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("table")}
                        title="Table View"
                      >
                        <i className="fas fa-table"></i>
                      </button>
                      <button
                        className={`actionBtn ${
                          viewMode === "calendar" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("calendar")}
                        title="Calendar View"
                      >
                        <i className="fas fa-calendar-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === "table" ? (
                <>
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
                </>
              ) : (
                <BeltTestsCalendarView
                  beltTests={sortedBeltTests}
                  fetchBeltTests={fetchBeltTests}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
