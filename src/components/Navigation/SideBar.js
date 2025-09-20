import { NavLink } from "react-router-dom";
import styles from "./SideBarStyle.module.css";
import { useState } from "react";
import { useTheme } from "../../utils/ThemeContext";
import QRCode from "react-qr-code";
import { AuthData } from "../../auth/AuthWrapper";

const SideBar = () => {
  const [showQR, setShowQR] = useState(false);
  const { isDark } = useTheme();
  const { user } = AuthData();

  const toggleQR = () => {
    setShowQR(!showQR);
  };

  return (
    <div
      className={`${!isDark ? styles.sidebar : styles.sidebarDark}  d-lg-block`}
    >
      <div className="text-center mb-4">
        <h4>
          <i className="fas fa-fist-raised"></i> نادي{" "}
          <span style={{ color: "var(--karate-accent)" }}>الكاراتيه</span>
        </h4>
        <hr className="bg-light" />
      </div>
      <ul className={`nav flex-column ${styles.navList}`}>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/" end>
            <i
              className={`fas fa-home ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الصفحة الرئيسية{" "}
          </NavLink>
        </li>
          <li className="nav-item">
            <NavLink className={styles.navLink} to="/users" end>
              <i
                className={`fas fa-user-tie ${
                  !isDark ? styles.icon : styles.iconDark
                } mx-2`}
              ></i>{" "}
              الموظفين{" "}
            </NavLink>
          </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/members" end>
            <i
              className={`fas fa-users ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الأعضاء{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/trainers" end>
            <i
              className={`fas fa-hand-fist ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            المدربين{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/attendances" end>
            <i
              className={`fas fa-clipboard-check ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            جدول الحضور{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/sessions" end>
            <i
              className={`fas fa-calendar-alt ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            جلسات التدريب{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/belt_tests" end>
            <i
              className={`fas fa-graduation-cap ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الاختبارات{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/subscriptions" end>
            <i
              className={`fas fa-calendar-check ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الاشتراكات{" "}
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/payments" end>
            <i
              className={`fas fa-money-bill-wave ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الدفع
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/reports" end>
            <i
              className={`fas fa-chart-line ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            تقارير
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className={styles.navLink} to="/setting" end>
            <i
              className={`fas fa-cog ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>{" "}
            الاعدادات{" "}
          </NavLink>
        </li>
      </ul>
      <div className="mt-auto">
        <hr className="bg-light" />
        <div className="d-flex flex-column align-items-center">
          <button
            onClick={toggleQR}
            className="btn btn-sm mb-2 me-4"
            style={{ color: "white" }}
          >
            <i
              className={`fas fa-qrcode ${
                !isDark ? styles.icon : styles.iconDark
              } mx-2`}
            ></i>
            الموقع الرسمي للنادي
          </button>
          {showQR && (
            <div className="p-2 bg-white rounded mb-2">
              <QRCode value="" size={128} level="H" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;

