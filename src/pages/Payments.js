import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import PaymentsList from "../components/Payments/PaymentsList";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import { exportToPDF } from "../utils/exportToPDF";
import { exportToCSV } from "../utils/exportToCSV";
import AddModal from "../components/Modals/AddModal";

export const Payments = () => {
  const { user } = AuthData();

  const [payments, setPayments] = useState([]);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(payments, ["memberName"], "memberName");

  const searchOptions = [{ value: "memberName", label: "اسم العضو" }];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchPayments(option);
  };

  const fetchPayments = (filter = "all") => {
    setIsLoading(true);

    axios
      .get("/api/Statistics/MonthlyRevenue", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      })
      .then((response) => {
        console.log(response);
        if (response.request.status === 200) {
          setMonthlyPayments(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    let endpoint = "/api/Payments/All";

    if (filter === "recent") {
      endpoint = "/api/Payments/All/Recent";
    }

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
          setPayments(response.data);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const getSortedPayments = (paymentsToSort) => {
    const sortedPayments = [...paymentsToSort];

    switch (sortOption) {
      case "date-asc":
        sortedPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "amount-asc":
        sortedPayments.sort((a, b) => a.amount - b.amount);
        break;
      case "amount-desc":
        sortedPayments.sort((a, b) => b.amount - a.amount);
        break;
      case "member-asc":
        sortedPayments.sort((a, b) => a.memberName.localeCompare(b.memberName));
        break;
      case "member-desc":
        sortedPayments.sort((a, b) => b.memberName.localeCompare(a.memberName));
        break;
      default:
        break;
    }

    return sortedPayments;
  };

  const analyzeRevenue = (data) => {
    if (data.length < 2) {
      return "Not enough data to compare";
    }

    const lastMonth = data[data.length - 1];
    const prevMonth = data[data.length - 2];

    const difference = lastMonth.monthlyRevenue - prevMonth.monthlyRevenue;
    const percentageDiff = (difference / prevMonth.monthlyRevenue) * 100;

    return {
      lastMonthRevenue: lastMonth.monthlyRevenue,
      percentageDifference: percentageDiff,
      comparison:
        difference >= 0
          ? `${Math.abs(percentageDiff).toFixed(2)}% اكثر من الشهر الماضي `
          : `${Math.abs(percentageDiff).toFixed(2)}% اقل من الشهر الماضي `,
    };
  };

  const revenueAnalysis = analyzeRevenue(monthlyPayments);

  const itemPerPage = 10;
  const sortedPayments = getSortedPayments(
    keyWord.length ? searchResult : payments
  );
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedPayments.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchPayments(filterOption);
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
                    💰 مدفوعات الأعضاء
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع جميع مدفوعات الأعضاء في النادي
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث عن مشترك..."
                      searchOptions={searchOptions}
                      selectedOption={selectedField}
                      setSelectedOption={setSelectedField}
                    />
                  </div>
                  <div className="d-flex">
                    <button
                      className="btn me-2"
                      style={{
                        backgroundColor: "var(--karate-primary)",
                        color: "white",
                      }}
                      onClick={() =>
                        exportToPDF(
                          sortedPayments.map((payment) => ({
                            date: new Date(payment.date).toLocaleDateString(
                              "ar-EG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            ),
                            amount: payment.amount,
                            name: payment.memberName,
                          })),
                          [
                            { key: "date", label: "التاريخ" },
                            { key: "amount", label: "المبلغ" },
                            { key: "name", label: "الاسم" },
                          ],
                          "سجل المدفوعات"
                        )
                      }
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      تصدير PDF
                    </button>
                    <button
                      className="btn mx-2"
                      style={{
                        backgroundColor: "var(--karate-secondary)",
                        color: "white",
                      }}
                      onClick={() =>
                        exportToCSV(
                          sortedPayments.map((payment) => ({
                            date: new Date(payment.date).toLocaleDateString(
                              "ar-EG",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            ),

                            amount: payment.payment,
                            name: payment.memberName,
                          })),
                          [
                            { key: "date", label: "التاريخ" },
                            { key: "amount", label: "المبلغ" },
                            { key: "name", label: "الاسم" },
                          ],
                          "سجل_المدفوعات.csv"
                        )
                      }
                    >
                      <i className="fas fa-file-csv me-2"></i>
                      تصدير CSV
                    </button>
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
                              إيرادات الشهر
                            </h5>
                            {typeof revenueAnalysis === "string" ? (
                              <p className="card-text">{revenueAnalysis}</p>
                            ) : (
                              <>
                                <p
                                  className="card-text mb-1"
                                  style={{
                                    fontSize: "2rem",
                                    fontWeight: "800",
                                  }}
                                >
                                  {revenueAnalysis.lastMonthRevenue.toLocaleString()}{" "}
                                  ل.س
                                </p>
                                <p
                                  className="card-text small mt-2 d-flex align-items-center"
                                  style={{
                                    color:
                                      revenueAnalysis.percentageDifference >= 0
                                        ? "#38a169"
                                        : "#e53e3e",
                                    fontWeight: "500",
                                  }}
                                >
                                  <i
                                    className={`fas fa-arrow-${
                                      revenueAnalysis.percentageDifference >= 0
                                        ? "up"
                                        : "down"
                                    } me-1`}
                                  ></i>
                                  {revenueAnalysis.comparison}
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
                              إجمالي المدفوعات
                            </h5>
                            <p
                              className="card-text mb-1"
                              style={{
                                fontSize: "2rem",
                                fontWeight: "800",
                              }}
                            >
                              {payments.length}
                            </p>
                            <p
                              className="card-text small mt-2"
                              style={{
                                opacity: 0.9,
                                fontWeight: "500",
                              }}
                            >
                              عملية دفع
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
                      الكل
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "recent" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("recent")}
                    >
                      حديثة
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
                        <option value="date-desc">الأحدث تاريخاً</option>
                        <option value="date-asc">الأقدم تاريخاً</option>
                        <option value="amount-desc">الأكبر مبلغاً</option>
                        <option value="amount-asc">الأصغر مبلغاً</option>
                        <option value="member-asc">الاسم (أ-ي)</option>
                        <option value="member-desc">الاسم (ي-أ)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <PaymentsList
                payments={pageItems}
                fetchPayments={fetchPayments}
              />
              {sortedPayments.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedPayments.length}
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
