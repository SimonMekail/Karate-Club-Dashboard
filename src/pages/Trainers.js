import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import TrainersListCardView from "../components/Trainers/TrainersListCardView";
import TrainersListTableView from "../components/Trainers/TrainerListTableView";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import AddModal from "../components/Modals/AddModal";
import { AddTrainerModal } from "../components/Modals/AddTrainerModal";

export const Trainers = () => {
  const { user } = AuthData();

  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterOption, setFilterOption] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [showAddModal, setShowAddModal] = useState(false);

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(trainers, ["personInfo.name"], "personInfo.name");

  const searchOptions = [{ value: "personInfo.name", label: "الاسم" }];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchTrainers(option);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const fetchTrainers = (filter) => {
    setIsLoading(true);
    setCurrentPage(1);

    let endpoint = "/api/Trainers/All";

    if (filter === "active") {
      endpoint = "/api/Trainers/All/Active";
    } else if (filter === "nonActive") {
      endpoint = "/api/Trainers/All/NonActive";
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
          setTrainers(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSortedTrainers = (trainersToSort) => {
    const sortedTrainers = [...trainersToSort];

    switch (sortOption) {
      case "name-asc":
        sortedTrainers.sort((a, b) =>
          a.personInfo.name.localeCompare(b.personInfo.name)
        );
        break;
      case "name-desc":
        sortedTrainers.sort((a, b) =>
          b.personInfo.name.localeCompare(a.personInfo.name)
        );
        break;
      default:
        break;
    }

    return sortedTrainers;
  };

  const itemPerPage = viewMode === "table" ? 10 : 8;
  const sortedTrainers = getSortedTrainers(
    keyWord.length ? searchResult : trainers
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedTrainers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchTrainers(filterOption);
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
                    <i className="fas fa-users me-2"></i> إدارة المدربين
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    عرض وتعديل معلومات المدربين في النادي
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث بالاسم..."
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
                    إضافة مدرب
                  </button>
                  <AddTrainerModal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    refreshData={fetchTrainers}
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
                <TrainersListTableView
                  trainers={pageItems}
                  fetchTrainers={fetchTrainers}
                />
              ) : (
                <TrainersListCardView
                  trainers={pageItems}
                  fetchTrainers={fetchTrainers}
                />
              )}

              {sortedTrainers.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedTrainers.length}
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
