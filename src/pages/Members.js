import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import MembersListCardView from "../components/Members/MembersListCardView";
import MembersListTableView from "../components/Members/MembersListTableView";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import { AddMemberModal } from "../components/Modals/AddMemberModal";

export const Members = () => {
  const { user } = AuthData();

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [beltRanks, setBeltRanks] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(members, ["personInfo.name", "beltRank"], "personInfo.name");

  const searchOptions = [
    { value: "personInfo.name", label: "الاسم" },
    { value: "beltRank", label: "الحزام" },
  ];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchMembers(option);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const deactivateExpiredMembers = () => {
    return axios.post(
      "/api/Members/DeactivateExpired",
      {},
      {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      }
    );
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await deactivateExpiredMembers();
      fetchMembers(filterOption);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchMembers = (filter) => {
    setIsLoading(true);
    setCurrentPage(1);

    let endpoint = "/api/Members/All";

    if (filter === "active") {
      endpoint = "/api/Members/All/Active";
    } else if (filter === "nonActive") {
      endpoint = "/api/Members/All/NonActive";
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
          setMembers(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSortedMembers = (membersToSort) => {
    const sortedMembers = [...membersToSort];

    switch (sortOption) {
      case "name-asc":
        sortedMembers.sort((a, b) =>
          a.personInfo.name.localeCompare(b.personInfo.name)
        );
        break;
      case "name-desc":
        sortedMembers.sort((a, b) =>
          b.personInfo.name.localeCompare(a.personInfo.name)
        );
        break;
      case "belt-asc":
        sortedMembers.sort((a, b) => a.beltRank.localeCompare(b.beltRank));
        break;
      case "belt-desc":
        sortedMembers.sort((a, b) => b.beltRank.localeCompare(a.beltRank));
        break;
      default:
        break;
    }

    return sortedMembers;
  };

  const itemPerPage = viewMode === "table" ? 10 : 8;
  const sortedMembers = getSortedMembers(
    keyWord.length ? searchResult : members
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedMembers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await deactivateExpiredMembers();
        fetchMembers(filterOption);
      } catch (error) {
        console.error("Error initializing data:", error);
        fetchMembers(filterOption);
      }
    };

    initializeData();
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
                    👥 إدارة الأعضاء
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع أعضاء النادي
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث عن عضو..."
                      searchOptions={searchOptions}
                      selectedOption={selectedField}
                      setSelectedOption={setSelectedField}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn me-2"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة مشترك
                  </button>
                  <button
                    type="button"
                    className="btn me-2"
                    style={{
                      backgroundColor: "var(--karate-secondary)",
                      color: "white",
                    }}
                    onClick={refreshData}
                    disabled={refreshing}
                  >
                    <i
                      className={`fas fa-sync-alt ${
                        refreshing ? "fa-spin" : ""
                      } me-2`}
                    ></i>
                    تحديث
                  </button>
                  <AddMemberModal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    refreshData={fetchMembers}
                    beltRanks={beltRanks}
                  />
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
                      <i className="fas fa-users me-1"></i> الكل
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "active" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("active")}
                    >
                      <i className="fas fa-user-check me-1"></i> نشط
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "nonActive" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("nonActive")}
                    >
                      <i className="fas fa-user-slash me-1"></i> غير نشط
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
                        <option value="name-asc">الاسم (أ-ي)</option>
                        <option value="name-desc">الاسم (ي-أ)</option>
                        <option value="belt-asc">الحزام (منخفض-عالي)</option>
                        <option value="belt-desc">الحزام (عالي-منخفض)</option>
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

              {viewMode === "table" ? (
                <MembersListTableView
                  members={pageItems}
                  fetchMembers={fetchMembers}
                  trainers={trainers}
                  beltRanks={beltRanks}
                  karateClasses={karateClasses}
                />
              ) : (
                <MembersListCardView
                  members={pageItems}
                  fetchMembers={fetchMembers}
                  trainers={trainers}
                  beltRanks={beltRanks}
                  karateClasses={karateClasses}
                />
              )}

              {sortedMembers.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedMembers.length}
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
