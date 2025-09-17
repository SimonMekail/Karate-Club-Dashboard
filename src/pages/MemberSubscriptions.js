import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import SubscriptionsList from "../components/Subscriptions/SubscriptionsList";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

export const MemberSubscriptions = () => {
  const { user } = AuthData();
  const { member_id } = useParams();

  const [subscriptions, setSubscriptions] = useState([]);
  const [karateClasses, setKarateClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("startDate-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [memberInfo, setMemberInfo] = useState(null);

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(subscriptions, ["className", "beltName"], "className");

  const searchOptions = [
    { value: "className", label: "اسم الفصل" },
    { value: "beltName", label: "الحزام" },
  ];

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
    let endpoint = "/api/Subscriptions/All/ByMemberID/" + member_id;

    if (filter === "active") {
      endpoint = "/api/Subscriptions/Active/ByMemberID/" + member_id;
    } else if (filter === "expired") {
      endpoint = "/api/Subscriptions/Expired/ByMemberID/" + member_id;
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
      case "class-asc":
        sortedSubscriptions.sort((a, b) =>
          a.className.localeCompare(b.className)
        );
        break;
      case "class-desc":
        sortedSubscriptions.sort((a, b) =>
          b.className.localeCompare(a.className)
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
    fetchMemberInfo();
  }, [user.token]);

  if (isLoading || !memberInfo) {
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
            <div className="d-flex justify-content-center align-items-center vh-100">
              <Spinner />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 backGroundColor">
      <div className="row">
        <div className="col-2 vh-100 sticky-top p-0">
          <SideBar />
        </div>
        <div className="col ps-0">
          <NavBar />

          <div className="p-4">
            {}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h3 mb-1" style={{ color: "var(--karate-text)" }}>
                  📝 اشتراكات العضو
                </h1>
                <p
                  className="mb-0"
                  style={{ color: "var(--karate-text-light)" }}
                >
                  عرض وإدارة اشتراكات العضو
                </p>
              </div>
              <div className="d-flex align-items-center">
                <div className="me-3" style={{ width: "500px" }}>
                  <SearchBar
                    keyWord={keyWord}
                    setKeyWord={setKeyWord}
                    setCurrentPage={setCurrentPage}
                    placeholder=" ابحث باسم الفصل او الحزام..."
                    searchOptions={searchOptions}
                    selectedOption={selectedField}
                    setSelectedOption={setSelectedField}
                  />
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
                              إجمالي الاشتراكات
                            </div>
                            <div
                              className="h4 mb-0 fw-bold"
                              style={{ color: "var(--karate-primary)" }}
                            >
                              {subscriptions.length}
                            </div>
                          </div>

                          <div className="d-flex">
                            <div
                              className="me-2 p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">نشطة</div>
                              <div className="h5 mb-0 fw-bold text-success">
                                {
                                  subscriptions.filter((sub) => {
                                    const endDate = new Date(sub.endDate);
                                    return endDate >= new Date();
                                  }).length
                                }
                              </div>
                            </div>

                            <div
                              className="p-2 rounded-3 text-center flex-grow-1"
                              style={{
                                backgroundColor: "var(--karate-card-hover)",
                              }}
                            >
                              <div className="text-muted small mb-1">
                                منتهية
                              </div>
                              <div className="h5 mb-0 fw-bold text-secondary">
                                {
                                  subscriptions.filter((sub) => {
                                    const endDate = new Date(sub.endDate);
                                    return endDate < new Date();
                                  }).length
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
                    الكل
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "active" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("active")}
                  >
                    نشطة
                  </button>
                  <button
                    className={`filterBtn ${
                      filterOption === "expired" ? "filterBtnActive" : ""
                    }`}
                    onClick={() => handleFilter("expired")}
                  >
                    منتهية
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
                      <option value="startDate-desc">
                        تاريخ البدء (الأحدث)
                      </option>
                      <option value="startDate-asc">
                        تاريخ البدء (الأقدم)
                      </option>
                      <option value="endDate-desc">
                        تاريخ الانتهاء (الأحدث)
                      </option>
                      <option value="endDate-asc">
                        تاريخ الانتهاء (الأقدم)
                      </option>
                      <option value="member-asc">اسم العضو (أ-ي)</option>
                      <option value="member-desc">اسم العضو (ي-أ)</option>
                      <option value="class-asc">اسم الفصل (أ-ي)</option>
                      <option value="class-desc">اسم الفصل (ي-أ)</option>
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
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
