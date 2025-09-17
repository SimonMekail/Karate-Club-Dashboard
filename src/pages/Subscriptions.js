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

export const Subscriptions = () => {
  const { user } = AuthData();

  const [subscriptions, setSubscriptions] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("endDate-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [monthlySubscriptions, setMonthlySubscriptions] = useState([]);

  const searchOptions = [
    { value: "memberName", label: "اسم العضو" },
    { value: "className", label: "اسم الصف" },
    { value: "beltName", label: "الحزام" },
  ];

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(
      subscriptions,
      ["memberName", "className", "beltName"],
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
    fetchSubscriptions(option);
  };

  const fetchSubscriptions = (filter) => {
    setIsLoading(true);
    let endpoint = "/api/Subscriptions/All";

    if (filter === "active") {
      endpoint = "/api/Subscriptions/All/Active";
    } else if (filter === "expired") {
      endpoint = "/api/Subscriptions/All/Expired";
    }

    axios
      .get("/api/Statistics/NewSubscriptionsMonthly", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
        if (response.request.status === 200) {
          setMonthlySubscriptions(response.data);
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
      .get(endpoint, {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
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

  const analyzeSubscriptions = (data) => {
    if (data.length < 2) {
      return "Not enough data to compare";
    }

    const lastMonth = data[data.length - 1];
    const prevMonth = data[data.length - 2];

    const difference = lastMonth.newSubscription - prevMonth.newSubscription;
    const percentageDiff = (difference / prevMonth.newSubscription) * 100;

    return {
      lastMonthNewSubscription: lastMonth.newSubscription,
      percentageDifference: percentageDiff,
      comparison:
        difference >= 0
          ? `${Math.abs(percentageDiff).toFixed(2)}% اكثر من الشهر الماضي `
          : `${Math.abs(percentageDiff).toFixed(2)}% اقل من الشهر الماضي `,
    };
  };

  const subscriptionsAnalysis = analyzeSubscriptions(monthlySubscriptions);

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
                    إدارة وتتبع اشتراكات الأعضاء في النادي
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
              <div className="row mb-4">
                <div className="col-md-8">
                  <div className="d-flex flex-column flex-md-row gap-3">
                    {}
                    <div
                      className="card summary-card flex-fill"
                      style={{
                        border: "none",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                        background: `linear-gradient(135deg, var(--karate-primary) 0%, var(--karate-primary-dark) 100%)`,
                        color: "white",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div className="card-body position-relative">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="z-1 position-relative">
                            <h5
                              className="card-title mb-3"
                              style={{
                                fontWeight: "600",
                                opacity: 0.9,
                              }}
                            >
                              اشتراكات الشهر
                            </h5>
                            {typeof subscriptionsAnalysis === "string" ? (
                              <p className="card-text">
                                {subscriptionsAnalysis}
                              </p>
                            ) : (
                              <>
                                <p
                                  className="card-text mb-1"
                                  style={{
                                    fontSize: "2rem",
                                    fontWeight: "800",
                                  }}
                                >
                                  {subscriptionsAnalysis.lastMonthNewSubscription.toLocaleString()}{" "}
                                  اشتراك
                                </p>
                                <p
                                  className="card-text small mt-2 d-flex align-items-center"
                                  style={{
                                    color:
                                      subscriptionsAnalysis.percentageDifference >=
                                      0
                                        ? "#38a169"
                                        : "#e53e3e",
                                    fontWeight: "500",
                                  }}
                                >
                                  <i
                                    className={`fas fa-arrow-${
                                      subscriptionsAnalysis.percentageDifference >=
                                      0
                                        ? "up"
                                        : "down"
                                    } me-1`}
                                  ></i>
                                  {subscriptionsAnalysis.comparison}
                                </p>
                              </>
                            )}
                          </div>
                          <div
                            className="icon-container z-1 position-relative"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="fas fa-chart-line"
                              style={{
                                color: "white",
                                fontSize: "1.8rem",
                              }}
                            ></i>
                          </div>
                        </div>
                      </div>
                      {}
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.1)",
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-30px",
                          left: "-30px",
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.07)",
                        }}
                      ></div>
                    </div>

                    {}
                    <div
                      className="card summary-card flex-fill"
                      style={{
                        border: "none",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                        background: `linear-gradient(135deg, var(--karate-secondary) 0%, var(--karate-secondary-dark) 100%)`,
                        color: "white",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div className="card-body position-relative">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="z-1 position-relative">
                            <h5
                              className="card-title mb-3"
                              style={{
                                fontWeight: "600",
                                opacity: 0.9,
                              }}
                            >
                              إجمالي الاشتراكات
                            </h5>
                            <p
                              className="card-text mb-1"
                              style={{
                                fontSize: "2rem",
                                fontWeight: "800",
                              }}
                            >
                              {subscriptions.length}
                            </p>
                            <p
                              className="card-text small mt-2"
                              style={{
                                opacity: 0.9,
                                fontWeight: "500",
                              }}
                            >
                              اشتراك
                            </p>
                          </div>
                          <div
                            className="icon-container z-1 position-relative"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <i
                              className="fas fa-receipt"
                              style={{
                                color: "white",
                                fontSize: "1.8rem",
                              }}
                            ></i>
                          </div>
                        </div>
                      </div>
                      {}
                      <div
                        style={{
                          position: "absolute",
                          top: "-20px",
                          right: "-20px",
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.1)",
                        }}
                      ></div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-30px",
                          left: "-30px",
                          width: "150px",
                          height: "150px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.07)",
                        }}
                      ></div>
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
                        filterOption === "active" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("active")}
                    >
                      <i className="fas fa-check-circle me-1"></i> نشط
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "expired" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("expired")}
                    >
                      <i className="fas fa-times-circle me-1"></i> منتهي
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
