import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import SessionsListCalenderView from "../components/Sessions/SessionsListCalenderView";
import SessionsList from "../components/Sessions/SessionsList";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import AddModal from "../components/Modals/AddModal";

export const Sessions = () => {
  const { user } = AuthData();

  const [sessions, setSessions] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [showAddModal, setShowAddModal] = useState(false);

  const searchOptions = [
    { value: "classInfo.name", label: "اسم الجلسة" },
    { value: "classInfo.trainerName", label: "اسم المدرب" },
  ];

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(
      sessions,
      ["classInfo.name", "classInfo.trainerName"],
      "classInfo.name"
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
    fetchSessions(option);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const fetchSessions = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/Sessions/All";

    if (filter === "upcoming") {
      endpoint = "/api/Sessions/All/Upcoming";
    } else if (filter === "past") {
      endpoint = "/api/Sessions/All/Past";
    }

    axios
      .get("/api/Classes/All", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
        if (response.request.status === 200) {
          setKarateClasses(response.data);
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
      case "name-asc":
        sortedSessions.sort((a, b) =>
          a.classInfo.name.localeCompare(b.classInfo.name)
        );
        break;
      case "name-desc":
        sortedSessions.sort((a, b) =>
          b.classInfo.name.localeCompare(a.classInfo.name)
        );
        break;
      default:
        break;
    }

    return sortedSessions;
  };

  const itemPerPage = viewMode === "card" ? 10 : 8;
  const sortedSessions = getSortedSessions(
    keyWord.length ? searchResult : sessions
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedSessions.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchSessions(filterOption);
  }, [user.token]);

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
                    <i className="fas fa-calendar-alt me-2"></i>إدارة الجلسات
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    عرض وتنظيم الجلسات التدريبية في النادي
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث باسم الجلسة أو المدرب..."
                      searchOptions={searchOptions}
                      selectedOption={selectedField}
                      setSelectedOption={setSelectedField}
                    />
                  </div>
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة جلسة جديدة
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
                      <i className="fas fa-calendar me-1"></i> الكل
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "upcoming" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("upcoming")}
                    >
                      <i className="fas fa-clock me-1"></i> القادمة
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "past" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("past")}
                    >
                      <i className="fas fa-history me-1"></i> المنتهية
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
                          <option value="name-asc">اسم الجلسة (أ-ي)</option>
                          <option value="name-desc">اسم الجلسة (ي-أ)</option>
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
                  karateClasses={karateClasses}
                  fetchSessions={fetchSessions}
                />
              ) : (
                <SessionsListCalenderView
                  sessions={sortedSessions}
                  karateClasses={karateClasses}
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

      {}
      <AddModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        itemType="جلسة"
        apiEndpoint="/api/sessions"
        formFields={[
          {
            name: "classID",
            label: "الصف",
            type: "select",
            required: true,
            options: karateClasses.map((cls) => ({
              value: cls.classID,
              label: cls.name,
            })),
          },
          {
            name: "date",
            label: "التاريخ",
            type: "date",
            required: true,
          },
          {
            name: "startTime",
            label: "وقت البدء",
            type: "time",
            required: true,
          },
          {
            name: "endTime",
            label: "وقت الانتهاء",
            type: "time",
            required: true,
          },
        ]}
        refreshData={fetchSessions}
        successMessage="تم إضافة الجلسة بنجاح"
        errorMessage="حدث خطأ أثناء إضافة الجلسة"
      />
    </div>
  );
};
