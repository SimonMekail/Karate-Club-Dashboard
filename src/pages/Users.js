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
import { AddUserModal } from "../components/Modals/AddUserModal";
import { EditUserModal } from "../components/Modals/EditUserModal";
import DeleteModal from "../components/Modals/DeleteModal";

export const Users = () => {
  const { user } = AuthData();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("name-asc");
  const [viewMode, setViewMode] = useState("card");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handlePageClick = (data) => {
    let pageNumber = data.selected + 1;
    setCurrentPage(pageNumber);
  };

  const { keyWord, setKeyWord, selectedField, setSelectedField, searchResult } =
    useSearch(users, ["name", "address", "number"], "name");

  const searchOptions = [
    { value: "name", label: "الاسم" },
    { value: "address", label: "العنوان" },
    { value: "number", label: "رقم الهاتف" },
  ];

  const handleSort = (option) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/Users/All", {
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          ...API_CONFIG.AUTH_HEADERS(user.token),
        },
      });

      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("فشل في تحميل بيانات المستخدمين. يرجى المحاولة مرة أخرى.");

    

      setUsers(sampleUsers);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const getSortedUsers = (usersToSort) => {
    const sortedUsers = [...usersToSort];

    switch (sortOption) {
      case "name-asc":
        sortedUsers.sort((a, b) =>
          a.personInfo.name.localeCompare(b.personInfo.name)
        );
        break;
      case "name-desc":
        sortedUsers.sort((a, b) =>
          b.personInfo.name.localeCompare(a.personInfo.name)
        );
        break;
      case "date-asc":
        sortedUsers.sort(
          (a, b) =>
            new Date(a.personInfo.startDate) - new Date(b.personInfo.startDate)
        );
        break;
      case "date-desc":
        sortedUsers.sort(
          (a, b) =>
            new Date(b.personInfo.startDate) - new Date(a.personInfo.startDate)
        );
        break;
      default:
        break;
    }

    return sortedUsers;
  };

  const itemPerPage = viewMode === "table" ? 10 : 8;
  const sortedUsers = getSortedUsers(keyWord.length ? searchResult : users);
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const pageItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser({
      ...user,
      ...user.personInfo,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const UserCard = ({ user }) => {
    return (
      <div
        className="card mb-4 position-relative"
        style={{
          backgroundColor: "var(--karate-card)",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.08)";
        }}
      >
        {}
        <div
          className="position-absolute top-0 end-0 m-3"
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: user.isActive ? "#2ecc71" : "#95a5a6",
            border: "2px solid var(--karate-card)",
            zIndex: 1,
          }}
          title={user.isActive ? "نشط" : "غير نشط"}
        ></div>

        {}
        <div
          className="card-header py-4 px-4 border-0 position-relative"
          style={{
            background:
              "linear-gradient(135deg, var(--karate-primary) 0%, var(--karate-secondary) 100%)",
            color: "white",
          }}
        >
          <div className="d-flex align-items-center">
            {user.personInfo.imagePath ? (
              <div
                className="rounded-circle"
                style={{
                  width: "70px",
                  height: "70px",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "3px solid rgba(255,255,255,0.3)",
                }}
              >
                <img
                  src={user.personInfo.imagePath}
                  alt={user.personInfo.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center w-100 h-100"
                  style={{
                    display: "none",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                  }}
                >
                  {user.personInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>
            ) : (
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "70px",
                  height: "70px",
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "3px solid rgba(255,255,255,0.3)",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                }}
              >
                {user.personInfo.name[0].toUpperCase()}
              </div>
            )}

            <div className="ms-3 flex-grow-1">
              <h5
                className="card-title mb-1"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                }}
              >
                {user.personInfo.name}
              </h5>
              <p
                className="card-text mb-0 opacity-90"
                style={{
                  fontSize: "0.9rem",
                }}
              >
                @{user.userName}
              </p>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {}
          <div className="mb-3">
            <div
              className="d-flex align-items-center mb-3 p-3 rounded"
              style={{
                backgroundColor: "rgba(var(--karate-primary-rgb), 0.05)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--karate-primary)",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-phone"></i>
              </div>
              <div>
                <div
                  style={{
                    color: "var(--karate-text-light)",
                    fontSize: "0.8rem",
                  }}
                >
                  رقم الهاتف
                </div>
                <div
                  style={{
                    color: "var(--karate-text)",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  {user.personInfo.number}
                </div>
              </div>
            </div>

            <div
              className="d-flex align-items-center p-3 rounded"
              style={{
                backgroundColor: "rgba(var(--karate-primary-rgb), 0.05)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle me-3"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "var(--karate-primary)",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <div
                  style={{
                    color: "var(--karate-text-light)",
                    fontSize: "0.8rem",
                  }}
                >
                  العنوان
                </div>
                <div
                  style={{
                    color: "var(--karate-text)",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                  }}
                >
                  {user.personInfo.address}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="d-flex justify-content-between align-items-center pt-3">
            <div className="d-flex align-items-center">
              <i
                className="fas fa-calendar-alt me-2"
                style={{ color: "var(--karate-primary)" }}
              ></i>
              <span
                style={{
                  color: "var(--karate-text-light)",
                  fontSize: "0.85rem",
                }}
              >
                انضم في{" "}
                {new Date(user.personInfo.startDate).toLocaleDateString(
                  "ar-EG"
                )}
              </span>
            </div>
            <div>
              <button
                className="btn btn-sm me-2 rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "var(--karate-primary)",
                  color: "white",
                  border: "none",
                }}
                title="تعديل"
                onClick={() => handleEditUser(user)}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="btn btn-sm rounded-circle"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#ffeaea",
                  color: "#e74c3c",
                  border: "none",
                }}
                title="حذف"
                onClick={() => handleDeleteUser(user)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const UsersTable = ({ users }) => {
    return (
      <div className="table-responsive">
        <table
          className="table table-hover"
          style={{
            backgroundColor: "var(--karate-card)",
            borderColor: "var(--karate-border)",
            color: "var(--karate-text)",
          }}
        >
          <thead
            style={{ backgroundColor: "var(--karate-primary)", color: "white" }}
          >
            <tr>
              <th scope="col">الصورة</th>
              <th scope="col">الاسم</th>
              <th scope="col">اسم المستخدم</th>
              <th scope="col">رقم الهاتف</th>
              <th scope="col">العنوان</th>
              <th scope="col">تاريخ البدء</th>
              <th scope="col">الحالة</th>
              <th scope="col">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.userID}>
                <td>
                  {user.personInfo.imagePath ? (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={user.personInfo.imagePath}
                        alt={user.personInfo.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="d-flex align-items-center justify-content-center w-100 h-100"
                        style={{
                          display: "none",
                          backgroundColor: "var(--karate-primary)",
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                        }}
                      >
                        {user.personInfo.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "var(--karate-primary)",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {user.personInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </td>
                <td>{user.personInfo.name}</td>
                <td>@{user.userName}</td>
                <td>{user.personInfo.number}</td>
                <td>{user.personInfo.address}</td>
                <td>
                  {new Date(user.personInfo.startDate).toLocaleDateString(
                    "ar-EG"
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      user.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {user.isActive ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm me-2"
                    style={{
                      backgroundColor: "var(--karate-primary)",
                      color: "white",
                    }}
                    onClick={() => handleEditUser(user)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
                    👥 إدارة الموظفين
                  </h1>
                  <p
                    className="mb-0"
                    style={{ color: "var(--karate-text-light)" }}
                  >
                    إدارة وتتبع مستخدمي النظام
                  </p>
                </div>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{ width: "500px" }}>
                    <SearchBar
                      keyWord={keyWord}
                      setKeyWord={setKeyWord}
                      setCurrentPage={setCurrentPage}
                      placeholder="ابحث عن مستخدم..."
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
                    إضافة مستخدم
                  </button>
                  <button
                    type="button"
                    className="btn me-2"
                    style={{
                      backgroundColor: "var(--karate-secondary)",
                      color: "white",
                    }}
                    onClick={() => {
                      setRefreshing(true);
                      fetchUsers();
                    }}
                    disabled={refreshing}
                  >
                    <i
                      className={`fas fa-sync-alt ${
                        refreshing ? "fa-spin" : ""
                      } me-2`}
                    ></i>
                    تحديث
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="alert alert-warning alert-dismissible fade show"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}

              {}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div></div> {}
                  <div className="d-flex align-items-center">
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
                        <option value="date-asc">الأقدم</option>
                        <option value="date-desc">الأحدث</option>
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
                <UsersTable users={pageItems} />
              ) : (
                <div className="row">
                  {pageItems.map((user) => (
                    <div
                      key={user.userID}
                      className="col-xl-3 col-lg-4 col-md-6"
                    >
                      <UserCard user={user} />
                    </div>
                  ))}
                </div>
              )}

              {sortedUsers.length > itemPerPage && (
                <div className="mt-4">
                  <Pagination
                    itemPerPage={itemPerPage}
                    totalItems={sortedUsers.length}
                    handlePageClick={handlePageClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        refreshData={fetchUsers}
      />

      {}
      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        refreshData={fetchUsers}
        userData={selectedUser}
      />

      {}
      <DeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        itemId={selectedUser?.userID}
        itemName={selectedUser?.personInfo?.name}
        itemType="المستخدم"
        deleteEndpoint={`/api/Users/${selectedUser?.userID}`}
        successMessage="تم حذف المستخدم بنجاح"
        errorMessage="حدث خطأ أثناء حذف المستخدم"
        refreshData={fetchUsers}
        additionalWarning="سيتم حذف جميع البيانات المرتبطة بهذا المستخدم ولا يمكن استرجاعها لاحقاً."
      />
    </div>
  );
};
