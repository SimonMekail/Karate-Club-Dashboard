import { useState, useEffect } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import Pagination from "../components/Navigation/Pagination";
import SearchBar from "../components/Search/SearchBar";
import { useSearch } from "../components/Search/Search";
import { API_CONFIG } from "../config";
import { AddKarateClassModal } from "../components/Modals/AddKarateClassModal";
import karateImage from "../assests/images/pexels-artempodrez-6253307.jpg";
import { Link } from "react-router-dom";
import EditModal from "../components/Modals/EditModal";
import DeleteModal from "../components/Modals/DeleteModal";
import { motion } from "framer-motion";
import { exportToPDF } from "../utils/exportToPDF";
import { exportToCSV } from "../utils/exportToCSV";

export const KarateClasses = () => {
  const { user } = AuthData();

  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("date-desc");
  const [filterOption, setFilterOption] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    availableClasses: 0,
    fullClasses: 0,
    totalEnrollment: 0,
    totalCapacity: 0,
  });

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(classes, ["name", "trainerName"], "name");

  const searchOptions = [
    { value: "name", label: "اسم الدورة" },
    { value: "trainerName", label: "اسم المدرب" },
  ];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleFilter = (option) => {
    setFilterOption(option);
    setCurrentPage(1);
    fetchKarateClasses(option);
  };

  const calculateStats = (classesData) => {
    const totalClasses = classesData.length;
    const availableClasses = classesData.filter(
      (c) => c.currentEnrollment < c.maxCapacity
    ).length;
    const fullClasses = classesData.filter(
      (c) => c.currentEnrollment >= c.maxCapacity
    ).length;
    const totalEnrollment = classesData.reduce(
      (sum, c) => sum + c.currentEnrollment,
      0
    );
    const totalCapacity = classesData.reduce(
      (sum, c) => sum + c.maxCapacity,
      0
    );

    return {
      totalClasses,
      availableClasses,
      fullClasses,
      totalEnrollment,
      totalCapacity,
    };
  };

  const fetchKarateClasses = (filter = "all") => {
    setIsLoading(true);
    setCurrentPage(1);

    let endpoint = "/api/Classes/All";

    if (filter === "available") {
      endpoint = "/api/Classes/All/Availble";
    } else if (filter === "complete") {
      endpoint = "/api/Classes/All/Complete";
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
        if (response.status === 200) {
          setTrainers(response.data);
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
        if (response.status === 200) {
          setClasses(response.data);
          setStats(calculateStats(response.data));
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("ar-EG", options);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ar-EG").format(price) + " ل.س";
  };

  const calculateProgressWidth = (current, max) => {
    return (current / max) * 100;
  };

  const getSortedClasses = (classesToSort) => {
    const sortedClasses = [...classesToSort];

    switch (sortOption) {
      case "date-asc":
        sortedClasses.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedClasses.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "name-asc":
        sortedClasses.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sortedClasses.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sortedClasses.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedClasses.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return sortedClasses;
  };

  const getFilteredClasses = (classesToFilter) => {
    return keyWord.length ? searchResult : classesToFilter;
  };

  const handleEditClick = (karateClass) => {
    setSelectedClass({
      classID: karateClass.classID,
      name: karateClass.name,
      trainerID: karateClass.trainerID,
      date: karateClass.date,
      price: karateClass.price,
      maxCapacity: karateClass.maxCapacity,
      currentEnrollment: karateClass.currentEnrollment,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (karateClass) => {
    setClassToDelete({
      id: karateClass.classID,
      name: karateClass.name,
    });
    setShowDeleteModal(true);
  };

  const handleAddKarateClass = () => {
    setShowClassModal(true);
  };

  const classFormFields = [
    {
      name: "name",
      label: "اسم الدورة",
      type: "text",
      required: true,
    },
    {
      name: "trainerID",
      label: "المدرب",
      type: "select",
      required: true,
      options: trainers.map((trainer) => ({
        value: trainer.trainerID,
        label: trainer.personInfo.name,
      })),
    },
    {
      name: "date",
      label: "تاريخ ووقت الدورة",
      type: "date",
      required: true,
    },
    {
      name: "price",
      label: "السعر",
      type: "text",
      required: true,
    },
    {
      name: "maxCapacity",
      label: "السعة القصوى",
      type: "text",
      required: true,
    },
    {
      name: "currentEnrollment",
      label: "السعة الحالية",
      type: "text",
      required: true,
    },
  ];

  const itemPerPage = 6;
  const filteredClasses = getFilteredClasses(classes);
  const sortedClasses = getSortedClasses(filteredClasses);
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedClasses.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchKarateClasses(filterOption);
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
                    🥋 دورات الكاراتيه
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    تصفح وسجل في جلسات التدريب
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      selectedField={selectedField}
                      setSelectedField={setSelectedField}
                      searchOptions={searchOptions}
                      placeholder="ابحث عن صف تدريب..."
                    />
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={handleAddKarateClass}
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    اضافة صف تدريب
                  </button>
                  <AddKarateClassModal
                    show={showClassModal}
                    onHide={() => setShowClassModal(false)}
                    refreshData={fetchKarateClasses}
                    trainers={trainers}
                  />
                </div>
              </div>

              {}
              <div className="row mb-4">
                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{ color: "var(--karate-primary)" }}
                      >
                        <i className="fas fa-dumbbell fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.totalClasses}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        إجمالي الصفوف
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{ color: "var(--karate-secondary)" }}
                      >
                        <i className="fas fa-check-circle fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.availableClasses}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        صفوف متاحة
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{ color: "var(--karate-accent)" }}
                      >
                        <i className="fas fa-exclamation-circle fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.fullClasses}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        صفوف مكتملة
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{ color: "var(--karate-primary)" }}
                      >
                        <i className="fas fa-users fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.totalEnrollment}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        إجمالي المسجلين
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{ color: "var(--karate-secondary)" }}
                      >
                        <i className="fas fa-chair fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.totalCapacity}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        السعة الإجمالية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6 col-lg-4 col-xl-2 mb-3">
                  <div
                    className="card stat-card h-100 border-0 shadow-sm"
                    style={{ backgroundColor: "var(--karate-card)" }}
                  >
                    <div className="card-body text-center p-3">
                      <div
                        className="stat-icon mb-2"
                        style={{
                          color:
                            stats.totalCapacity > 0
                              ? "var(--karate-primary)"
                              : "var(--karate-text-light)",
                        }}
                      >
                        <i className="fas fa-chart-pie fa-2x"></i>
                      </div>
                      <h3
                        className="stat-value mb-1"
                        style={{ color: "var(--karate-text)" }}
                      >
                        {stats.totalCapacity > 0
                          ? `${Math.round(
                              (stats.totalEnrollment / stats.totalCapacity) *
                                100
                            )}%`
                          : "0%"}
                      </h3>
                      <p
                        className="stat-label mb-0 small"
                        style={{ color: "var(--karate-text-light)" }}
                      >
                        نسبة التسجيل
                      </p>
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
                        filterOption === "available" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("available")}
                    >
                      متاح
                    </button>
                    <button
                      className={`filterBtn ${
                        filterOption === "complete" ? "filterBtnActive" : ""
                      }`}
                      onClick={() => handleFilter("complete")}
                    >
                      مكتمل
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
                        <option value="name-asc">الاسم (أ-ي)</option>
                        <option value="name-desc">الاسم (ي-أ)</option>
                        <option value="price-asc">السعر (منخفض)</option>
                        <option value="price-desc">السعر (مرتفع)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="class-grid row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {pageItems.map((karateClass) => (
                  <div key={karateClass.classID} className="col">
                    <div
                      className="class-card card h-100 border-0 shadow-sm position-relative"
                      style={{
                        transition: "all 0.3s ease",
                        backgroundColor: "var(--karate-card)",
                      }}
                    >
                      <div
                        className="class-image position-relative"
                        style={{
                          height: "180px",
                          backgroundImage: `url(${karateImage})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        <div
                          className="position-absolute bottom-0 start-0 w-100"
                          style={{
                            height: "50%",
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.7), transparent",
                          }}
                        />
                      </div>
                      <div className="class-content card-body">
                        <h5
                          className="class-name fw-bold mb-2"
                          style={{ color: "var(--karate-text)" }}
                        >
                          {karateClass.name}
                        </h5>

                        <p
                          className="class-trainer fw-bold mb-3"
                          style={{ color: "var(--karate-primary)" }}
                        >
                          <i className="bi bi-person me-2"></i>
                          {karateClass.trainerName}
                        </p>

                        <div
                          className={`availability mb-3 ${
                            karateClass.currentEnrollment >=
                            karateClass.maxCapacity
                              ? "var(--karate-accent)"
                              : "text-success"
                          }`}
                          style={{
                            color:
                              karateClass.currentEnrollment >=
                              karateClass.maxCapacity
                                ? "var(--karate-accent)"
                                : "var(--karate-secondary)",
                          }}
                        >
                          <i
                            className={`bi ${
                              karateClass.currentEnrollment >=
                              karateClass.maxCapacity
                                ? "bi-exclamation-circle"
                                : "bi-check-circle"
                            } me-2`}
                          ></i>
                          {karateClass.currentEnrollment >=
                          karateClass.maxCapacity
                            ? "مكتمل"
                            : `${
                                karateClass.maxCapacity -
                                karateClass.currentEnrollment
                              } مقاعد متاحة`}
                        </div>

                        <div
                          className="class-details d-flex flex-wrap gap-3 mb-4 small"
                          style={{ color: "var(--karate-text-light)" }}
                        >
                          <div className="detail-item d-flex align-items-center">
                            <i
                              className="bi bi-calendar me-2"
                              style={{ color: "var(--karate-primary)" }}
                            ></i>
                            <span>{formatDate(karateClass.date)}</span>
                          </div>
                          <div className="detail-item d-flex align-items-center">
                            <i
                              className="bi bi-clock me-2"
                              style={{ color: "var(--karate-primary)" }}
                            ></i>
                            <span>{formatTime(karateClass.date)}</span>
                          </div>
                        </div>
                        <div className="capacity-info mb-3">
                          <div className="d-flex justify-content-start align-items-center small">
                            <span
                              className="me-2"
                              style={{ color: "var(--karate-text-light)" }}
                            >
                              السعة:
                            </span>
                            <span style={{ color: "var(--karate-text)" }}>
                              {karateClass.currentEnrollment} /{" "}
                              {karateClass.maxCapacity}
                            </span>
                          </div>
                        </div>

                        <div
                          className="progress capacity-bar mb-4"
                          style={{ height: "6px" }}
                        >
                          <div
                            className="progress-bar"
                            style={{
                              width: `${calculateProgressWidth(
                                karateClass.currentEnrollment,
                                karateClass.maxCapacity
                              )}%`,
                              backgroundColor:
                                karateClass.currentEnrollment >=
                                karateClass.maxCapacity
                                  ? "var(--karate-accent)"
                                  : "var(--karate-secondary)",
                            }}
                          ></div>
                        </div>

                        <div
                          className="class-footer d-flex justify-content-between align-items-center pt-3 border-top"
                          style={{ borderColor: "var(--karate-border)" }}
                        >
                          <div
                            className="class-price fw-bold fs-5"
                            style={{ color: "var(--karate-primary)" }}
                          >
                            {formatPrice(karateClass.price)}
                          </div>
                          <div className="d-flex gap-2">
                            {}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm btn-icon"
                              onClick={() => handleEditClick(karateClass)}
                              style={{
                                backgroundColor: "rgba(13, 71, 161, 0.1)",
                                color: "var(--karate-primary)",
                                borderRadius: "8px",
                                width: "36px",
                                height: "36px",
                                border: "none",
                              }}
                              title="تعديل"
                            >
                              <i className="fas fa-edit"></i>
                            </motion.button>

                            {}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm btn-icon"
                              style={{
                                backgroundColor: "rgba(220, 53, 69, 0.1)",
                                color: "var(--karate-error)",
                                borderRadius: "8px",
                                width: "36px",
                                height: "36px",
                                border: "none",
                              }}
                              title="حذف"
                              onClick={() => handleDeleteClick(karateClass)}
                            >
                              <i className="fas fa-trash"></i>
                            </motion.button>

                            {}
                            <div className="dropdown">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-sm btn-icon"
                                type="button"
                                id={`dropdownMenuButton-${karateClass.classID}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{
                                  backgroundColor: "rgba(108, 117, 125, 0.1)",
                                  color: "#6c757d",
                                  borderRadius: "8px",
                                  width: "36px",
                                  height: "36px",
                                  border: "none",
                                }}
                                title="خيارات"
                              >
                                <i className="fas fa-ellipsis-v"></i>
                              </motion.button>
                              <ul
                                className="dropdown-menu dropdown-menu-end shadow-sm"
                                aria-labelledby={`dropdownMenuButton-${karateClass.classID}`}
                                style={{
                                  border: "none",
                                  borderRadius: "12px",
                                  padding: "8px",
                                  backgroundColor: "var(--karate-card)",
                                }}
                              >
                                <motion.li whileHover={{ scale: 1.02 }}>
                                  <Link
                                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                                    to={`/KarateClassesSessions/${karateClass.classID}`}
                                    style={{
                                      fontSize: "0.875rem",
                                      color: "var(--karate-text)",
                                    }}
                                  >
                                    <div
                                      className="icon-container bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                                      style={{ width: "24px", height: "24px" }}
                                    >
                                      <i className="fas fa-calendar fs-6"></i>
                                    </div>
                                    الجلسات
                                  </Link>
                                </motion.li>
                                <motion.li whileHover={{ scale: 1.02 }}>
                                  <Link
                                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded"
                                    to={`/KarateClassesSubscriptions/${karateClass.classID}`}
                                    style={{
                                      fontSize: "0.875rem",
                                      color: "var(--karate-text)",
                                    }}
                                  >
                                    <div
                                      className="icon-container bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                                      style={{ width: "24px", height: "24px" }}
                                    >
                                      <i className="fas fa-people-group fs-6"></i>
                                    </div>
                                    الاشتراكات
                                  </Link>
                                </motion.li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sortedClasses.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedClasses.length}
                    handlePageClick={handlePageClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      {selectedClass && (
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          itemId={selectedClass.classID}
          itemType="صف الكاراتيه"
          initialData={{
            name: selectedClass.name,
            trainerID: selectedClass.trainerID,
            date: selectedClass.date.split("T")[0],
            price: selectedClass.price,
            maxCapacity: selectedClass.maxCapacity,
            currentEnrollment: selectedClass.currentEnrollment,
          }}
          formFields={classFormFields}
          apiEndpoint="/api/Classes/"
          refreshData={() => fetchKarateClasses(filterOption)}
          successMessage={`تم تعديل ${selectedClass.name} بنجاح`}
        />
      )}

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={classToDelete?.id}
        itemName={classToDelete?.name}
        itemType="صف الكاراتيه"
        deleteEndpoint={`/api/Classes/${classToDelete?.id}`}
        successMessage="تم حذف الصف بنجاح"
        errorMessage="فشل في حذف الصف"
        refreshData={() => fetchKarateClasses(filterOption)}
      />
    </div>
  );
};
