import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import AttendancesList from "../components/Attendances/AttendancesList";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import { useParams } from "react-router-dom";

export const SessionAttendances = () => {
  const { user } = AuthData();
  const { session_id } = useParams();

  const [attendances, setAttendances] = useState([]);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(attendances, ["memberName", "lastBeltName"], "memberName");

  const searchOptions = [
    { value: "memberName", label: "اسم العضو" },
    { value: "lastBeltName", label: "الحزام" },
  ];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchAttendances(option);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const fetchSessionData = () => {
    axios
      .get(`/api/Sessions/${session_id}`, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setSession(response.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchAttendances = (filter = "all") => {
    setIsLoading(true);

    let endpoint = "/api/Attendances/All/BySessionID/" + session_id;

    if (filter === "present") {
      endpoint = `/api/Attendances/All/BySessionID/Present/${session_id}`;
    } else if (filter === "absent") {
      endpoint = `/api/Attendances/All/BySessionID/Absent/${session_id}`;
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
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
  const sortedAttendances = getSortedAttendances(
    keyWord.length ? searchResult : attendances
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedAttendances.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchSessionData();
    fetchAttendances();
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
                    <i className="fas fa-user-check me-2"></i> سجلات الحضور في
                    جلسة {session?.classInfo.name}
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    عرض وإدارة سجلات حضور الأعضاء للجلسة الحالية
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث باسم العضو أو الحزام..."
                      searchOptions={searchOptions}
                      selectedOption={selectedField}
                      setSelectedOption={setSelectedField}
                    />
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
                      الحضور فقط
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "absent" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("absent")}
                    >
                      الغياب فقط
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
                    <div className="actionButtons">
                      <button
                        className={`actionBtn ${
                          viewMode === "table" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("table")}
                        title="Table View"
                      >
                        <i className="fas fa-list"></i>
                      </button>
                      <button
                        className={`actionBtn ${
                          viewMode === "card" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("card")}
                        title="Card View"
                      >
                        <i className="fas fa-th-large"></i>
                      </button>
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
          )}
        </div>
      </div>
    </div>
  );
};
