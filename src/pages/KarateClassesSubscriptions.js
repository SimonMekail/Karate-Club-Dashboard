import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import SubscriptionsList from "../components/Subscriptions/SubscriptionsList";
import Pagination from "../components/Navigation/Pagination";
import { API_CONFIG } from "../config";
import { useSearch } from "../components/Search/Search";
import SearchBar from "../components/Search/SearchBar";
import { useParams } from "react-router-dom";

export const KarateClassesSubscriptions = () => {
  const { user } = AuthData();
  const { class_id } = useParams();

  const [subscriptions, setSubscriptions] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("endDate-desc");
  const [filterOption, setFilterOption] = useState("all");

  const searchOptions = [
    { value: "memberName", label: "اسم العضو" },
    { value: "beltName", label: "الحزام" },
  ];

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(subscriptions, ["memberName", "beltName"], "memberName");

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
    fetchSubscriptions(option);
  };

  const fetchSubscriptions = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/Subscriptions/All/ByClassID/" + class_id;

    if (filter === "active") {
      endpoint = "/api/Subscriptions/Active/ByClassID/" + class_id;
    } else if (filter === "expired") {
      endpoint = "/api/Subscriptions/Expired/ByClassID/" + class_id;
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
        if (response.request.status === 200) {
          setSubscriptions(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSortedSubscriptions = (subscriptionsToSort) => {
    const sortedSubscriptions = [...subscriptionsToSort];

    switch (sortOption) {
      case "startDate-asc":
        sortedSubscriptions.sort(
          (a, b) => new Date(a.startDate) - new Date(b.startDate)
        );
        break;
      case "startDate-desc":
        sortedSubscriptions.sort(
          (a, b) => new Date(b.startDate) - new Date(a.startDate)
        );
        break;
      case "endDate-asc":
        sortedSubscriptions.sort(
          (a, b) => new Date(a.endDate) - new Date(b.endDate)
        );
        break;
      case "endDate-desc":
        sortedSubscriptions.sort(
          (a, b) => new Date(b.endDate) - new Date(a.endDate)
        );
        break;
      case "member-asc":
        sortedSubscriptions.sort((a, b) =>
          a.memberName.localeCompare(b.memberName)
        );
        break;
      case "member-desc":
        sortedSubscriptions.sort((a, b) =>
          b.memberName.localeCompare(a.memberName)
        );
        break;
      default:
        break;
    }

    return sortedSubscriptions;
  };

  const itemPerPage = 10;
  const sortedSubscriptions = getSortedSubscriptions(
    keyWord.length ? searchResult : subscriptions
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedSubscriptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  useEffect(() => {
    fetchSubscriptions(filterOption);
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
                    📝 اشتراكات الأعضاء
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع اشتراكات الأعضاء في الفصل
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
                        filterOption === "active" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("active")}
                    >
                      نشط
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "expired" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("expired")}
                    >
                      منتهي
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
                        <option value="endDate-desc">
                          تاريخ الانتهاء (الأحدث)
                        </option>
                        <option value="endDate-asc">
                          تاريخ الانتهاء (الأقدم)
                        </option>
                        <option value="startDate-desc">
                          تاريخ البدء (الأحدث)
                        </option>
                        <option value="startDate-asc">
                          تاريخ البدء (الأقدم)
                        </option>
                        <option value="member-asc">الاسم (أ-ي)</option>
                        <option value="member-desc">الاسم (ي-أ)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <SubscriptionsList
                subscriptions={pageItems}
                karateClasses={karateClasses}
                fetchSubscriptions={fetchSubscriptions}
              />

              {sortedSubscriptions.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedSubscriptions.length}
                    handlePageClick={handlePageClick}
                    currentPage={currentPage - 1}
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
