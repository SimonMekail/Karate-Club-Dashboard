import { AuthData } from "../../auth/AuthWrapper";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "./NavBarStyle.module.css";

import { useTheme } from "../../utils/ThemeContext";

const NavBar = () => {
  const { user, logout } = AuthData();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async (e) => {
    e.preventDefault();
    localStorage.clear();
    await logout();
    navigate("/login");
  };

  return (
    <nav className={`navbar navbar-expand-lg mb-4 rounded ${styles.navbar}`}>
      <div className="container-fluid">
        {}
        <button
          className="navbar-toggler me-2"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapseContent"
          aria-controls="navbarCollapseContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ color: "var(--karate-primary)" }}
        >
          <i className="fas fa-bars"></i>
        </button>

        {}
        <Link
          className="navbar-brand"
          to="/"
          style={{ color: "var(--karate-primary)" }}
        >
          <i className="fas fa-fist-raised"></i> نادي الكاراتيه
        </Link>

        {}
        <div className="collapse navbar-collapse" id="navbarCollapseContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 d-lg-none">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/"
                style={{ color: "var(--karate-text)" }}
              >
                الرئيسية
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/members"
                style={{ color: "var(--karate-text)" }}
              >
                الأعضاء
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/trainers"
                style={{ color: "var(--karate-text)" }}
              >
                المدربين
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/belt_tests"
                style={{ color: "var(--karate-text)" }}
              >
                اختبارات الأحزمة
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/payments"
                style={{ color: "var(--karate-text)" }}
              >
                المدفوعات
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/attendances"
                style={{ color: "var(--karate-text)" }}
              >
                الحضور
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/sessions"
                style={{ color: "var(--karate-text)" }}
              >
                التدريبات
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/subscriptions"
                style={{ color: "var(--karate-text)" }}
              >
                الاشتراكات
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/reports"
                style={{ color: "var(--karate-text)" }}
              >
                التقارير
              </Link>
            </li>
          </ul>
        </div>

        {}
        <div className="d-flex align-items-center ms-auto">
          {}
          <div className="theme-toggle-wrapper me-3">
            <input
              type="checkbox"
              className="theme-checkbox"
              id="themeCheckbox"
              checked={isDark}
              onChange={toggleTheme}
              hidden
            />
            <label
              htmlFor="themeCheckbox"
              className="theme-toggle-btn d-flex align-items-center"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50px",
                backgroundColor: isDark
                  ? "var(--karate-primary)"
                  : "var(--karate-light-bg)",
                transition: "all 0.3s ease",
                width: "60px",
                height: "30px",
                position: "relative",
                border: isDark ? "none" : "1px solid var(--karate-border)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: isDark ? "2px" : "32px",
                  left: isDark ? "auto" : "2px",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: isDark
                    ? "var(--karate-card)"
                    : "var(--karate-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {isDark ? (
                  <i
                    className="fas fa-moon"
                    style={{ color: "var(--karate-primary)", fontSize: "12px" }}
                  ></i>
                ) : (
                  <i
                    className="fas fa-sun"
                    style={{ color: "white", fontSize: "12px" }}
                  ></i>
                )}
              </span>
              <span
                className="theme-label visually-hidden"
                style={{ marginRight: "10px", fontSize: "0.85rem" }}
              >
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </label>
          </div>

          <div className="dropdown me-3">
            <Link
              className="btn btn-sm"
              to="/Notifications"
              style={{ color: "var(--karate-primary)" }}
            >
              <i className="fas fa-bell"></i>
              {/* <span
                className="badge rounded-pill"
                style={{
                  backgroundColor: "var(--karate-accent)",
                  color: "white",
                }}
              >
                3
              </span> */}
            </Link>

            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{ backgroundColor: "var(--karate-card)" }}
            >
              <li>
                <a
                  className="dropdown-item"
                  href="ww"
                  style={{ color: "var(--karate-text)" }}
                >
                  New belt test scheduled
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="ww"
                  style={{ color: "var(--karate-text)" }}
                >
                  5 new members registered
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="ww"
                  style={{ color: "var(--karate-text)" }}
                >
                  Upcoming tournament
                </a>
              </li>
            </ul>
          </div>
          <div className="dropdown">
            <button
              className="btn btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              style={{ color: "var(--karate-primary)" }}
            >
              {user.name}
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end"
              style={{ backgroundColor: "var(--karate-card)" }}
            >
              {/* <li>
                <Link
                  className="dropdown-item"
                  to="/profile"
                  style={{ color: "var(--karate-text)" }}
                >
                  <i className="fas fa-user me-2"></i> الملف الشخصي{" "}
                </Link>
              </li> */}
              <li>
                <hr
                  className="dropdown-divider"
                  style={{ backgroundColor: "var(--karate-border)" }}
                />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                  style={{ color: "var(--karate-error)" }}
                >
                  <i className="fas fa-sign-out-alt me-2"></i> تسجيل الخروج{" "}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
