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
import { useParams } from "react-router-dom";

export const BeltTestsByRank = () => {
  const { user } = AuthData();
  const { rank_id } = useParams();

  const [beltTests, setBeltTests] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [beltRanks, setBeltRanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  const searchOptions = [
    { value: "memberName", label: "اسم العضو" },
    { value: "trainerName", label: "اسم المدرب" },
  ];

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(beltTests, ["memberName", "trainerName"], "memberName");

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

  const fetchBeltTests = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/BeltTests/All/ByBeltRankID/" + rank_id;

    if (filter === "passed") {
      endpoint = "/api/BeltTests/Passed/ByBeltRankID/" + rank_id;
    } else if (filter === "failed") {
      endpoint = "/api/BeltTests/Failed/ByBeltRankID/" + rank_id;
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
  }, [user.token, rank_id]);

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
                    🥋 اختبارات الحزام حسب الرتبة
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع اختبارات الحزام لهذه الرتبة
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
                        filterOption === "passed" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("passed")}
                    >
                      ناجح
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "failed" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("failed")}
                    >
                      غير ناجح
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
