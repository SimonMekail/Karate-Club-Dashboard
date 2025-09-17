import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import SessionsListCalenderView from "../components/Sessions/SessionsListCalenderView";
import SessionsList from "../components/Sessions/SessionsList";
import Pagination from "../components/Navigation/Pagination";
import { API_CONFIG } from "../config";
import { useParams } from "react-router-dom";
import { generateKarateClassSession } from "../utils/generateKarateClassSession";

export const KarateClassesSessions = () => {
  const { user } = AuthData();
  const { class_id } = useParams();

  const [sessions, setSessions] = useState([]);
  const [karateClass, setKarateClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("card");

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
    fetchSessions(option);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const fetchSessions = (filter) => {
    setIsLoading(true);
    let endpoint = `/api/Sessions/All/ByClassID/${class_id}`;

    if (filter === "upcoming") {
      endpoint = `/api/Sessions/Upcoming/ByClassID/${class_id}`;
    } else if (filter === "past") {
      endpoint = `/api/Sessions/Past/ByClassID/${class_id}`;
    }

    axios
      .get(`/api/Classes/${class_id}`, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (response.request.status === 200) {
          setKarateClass(response.data);
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
          setSessions(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSortedSessions = (sessionsToSort) => {
    const sortedSessions = [...sessionsToSort];

    switch (sortOption) {
      case "date-asc":
        sortedSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedSessions.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;

      default:
        break;
    }

    return sortedSessions;
  };

  const itemPerPage = viewMode === "card" ? 10 : 8;
  const sortedSessions = getSortedSessions(sessions);
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedSessions.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchSessions(filterOption);
  }, [user.token, class_id]);

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
                    <i className="fas fa-calendar-alt me-2"></i>
                    {karateClass?.name
                      ? `جلسات صف ${karateClass.name}`
                      : "جلسات الصف"}
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    عرض وتنظيم الجلسات التدريبية للصف
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}></div>
                  <button
                    type="button"
                    className="btn me-2"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                    onClick={() =>
                      generateKarateClassSession(
                        sessions,
                        "karate_schedule.pdf"
                      )
                    }
                  >
                    <i className="fas fa-calendar mx-2"></i>
                    جدول الجلسات
                  </button>
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
                        filterOption === "upcoming" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("upcoming")}
                    >
                      القادمة
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "past" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("past")}
                    >
                      المنتهية
                    </button>
                  </div>
                  <div className="rightControls">
                    {viewMode === "card" ? (
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
                          <option value="date-desc">الأحدث أولاً</option>
                          <option value="date-asc">الأقدم أولاً</option>
                        </select>
                      </div>
                    ) : null}
                    <div className="actionButtons">
                      <button
                        className={`actionBtn ${
                          viewMode === "card" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("card")}
                        title="Card View"
                      >
                        <i className="fas fa-table"></i>
                      </button>
                      <button
                        className={`actionBtn ${
                          viewMode === "calender" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("calender")}
                        title="Calendar View"
                      >
                        <i className="fas fa-calendar-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === "card" ? (
                <SessionsList
                  sessions={pageItems}
                  karateClasses={karateClass ? [karateClass] : []}
                  fetchSessions={fetchSessions}
                />
              ) : (
                <SessionsListCalenderView
                  sessions={sortedSessions}
                  karateClasses={karateClass ? [karateClass] : []}
                  fetchSessions={fetchSessions}
                />
              )}

              {sortedSessions.length > itemPerPage && viewMode === "card" && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedSessions.length}
                    handlePageClick={handlePageClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
