import { useState } from "react";
import axios from "axios";
import { AuthData } from "../auth/AuthWrapper";
import SideBar from "../components/Navigation/SideBar";
import NavBar from "../components/Navigation/NavBar";
import Spinner from "../components/Spinner/Spinner";
import { API_CONFIG } from "../config";
import { motion } from "framer-motion";

export const Settings = () => {
  const { user } = AuthData();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: user.password || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });

    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: "",
      });
    }

    if (apiError) {
      setApiError("");
    }
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validatePasswordForm()) {
      setIsLoading(true);

      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/Users/ChangePassword?UserID=${
            user.userID
          }&NewPassword=${encodeURIComponent(passwordForm.newPassword)}`,
          null,
          {
            headers: {
              Accept: API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (response.status === 200) {
          setPasswordSuccess(true);
          setPasswordForm({
            currentPassword: user.password || "",
            newPassword: "",
            confirmPassword: "",
          });
          setPasswordErrors({});

          setTimeout(() => setPasswordSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Password change error:", error);

        if (error.response?.data) {
          setApiError(
            error.response.data.message ||
              "An error occurred while changing password"
          );
        } else if (error.request) {
          setApiError("Network error. Please check your connection.");
        } else {
          setApiError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    }
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="p-4"
          >
            <h1 className="h3 mb-4" style={{ color: "var(--karate-text)" }}>
              <i
                className="fas fa-cog me-2"
                style={{ color: "var(--karate-primary)" }}
              ></i>
              الإعدادات
            </h1>

            <div className="row">
              <div className="col-md-3">
                <div
                  className="settings-nav rounded-3 p-3 mb-4 mb-md-0"
                  style={{
                    background: "var(--karate-card)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    className={`settings-nav-item p-3 rounded-2 mb-2 ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        activeTab === "profile"
                          ? "rgba(var(--karate-primary-rgb), 0.1)"
                          : "transparent",
                      borderLeft:
                        activeTab === "profile"
                          ? "4px solid var(--karate-primary)"
                          : "4px solid transparent",
                      color: "var(--karate-text)",
                    }}
                    onClick={() => setActiveTab("profile")}
                  >
                    <i className="fas fa-user me-2"></i>
                    الملف الشخصي
                  </div>
                  <div
                    className={`settings-nav-item p-3 rounded-2 mb-2 ${
                      activeTab === "password" ? "active" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        activeTab === "password"
                          ? "rgba(var(--karate-primary-rgb), 0.1)"
                          : "transparent",
                      borderLeft:
                        activeTab === "password"
                          ? "4px solid var(--karate-primary)"
                          : "4px solid transparent",
                      color: "var(--karate-text)",
                    }}
                    onClick={() => setActiveTab("password")}
                  >
                    <i className="fas fa-lock me-2"></i>
                    كلمة المرور
                  </div>
                  <div
                    className={`settings-nav-item p-3 rounded-2 mb-2 ${
                      activeTab === "notifications" ? "active" : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        activeTab === "notifications"
                          ? "rgba(var(--karate-primary-rgb), 0.1)"
                          : "transparent",
                      borderLeft:
                        activeTab === "notifications"
                          ? "4px solid var(--karate-primary)"
                          : "4px solid transparent",
                      color: "var(--karate-text)",
                    }}
                    onClick={() => setActiveTab("notifications")}
                  >
                    <i className="fas fa-bell me-2"></i>
                    الإشعارات
                  </div>
                </div>
              </div>

              <div className="col-md-9">
                <div
                  className="settings-content rounded-3 p-4"
                  style={{
                    background: "var(--karate-card)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    minHeight: "400px",
                  }}
                >
                  {activeTab === "profile" && (
                    <div>
                      <h3
                        className="h5 mb-4"
                        style={{ color: "var(--karate-text)" }}
                      >
                        الملف الشخصي
                      </h3>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            الاسم
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.name || ""}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            اسم المستخدم
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.userName || ""}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        {/* <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            البريد الإلكتروني
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={user.email || ""}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div> */}
                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            حالة الحساب
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.isActive ? "نشط" : "غير نشط"}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            رقم المستخدم
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.userID || ""}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div>
                        <div className="col-md-6">
                          <label
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            رقم الشخص
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.personID || ""}
                            disabled
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: "var(--karate-border)",
                            }}
                          />
                        </div>
                      </div>
                      <button
                        className="btn"
                        style={{
                          backgroundColor: "var(--karate-secondary)",
                          color: "white",
                        }}
                      >
                        تحديث الملف الشخصي
                      </button>
                    </div>
                  )}

                  {activeTab === "password" && (
                    <div>
                      <h3
                        className="h5 mb-4"
                        style={{ color: "var(--karate-text)" }}
                      >
                        تغيير كلمة المرور
                      </h3>

                      {passwordSuccess && (
                        <div
                          className="alert alert-success d-flex align-items-center"
                          role="alert"
                        >
                          <i className="fas fa-check-circle me-2"></i>
                          تم تغيير كلمة المرور بنجاح!
                        </div>
                      )}

                      {apiError && (
                        <div
                          className="alert alert-danger d-flex align-items-center"
                          role="alert"
                        >
                          <i className="fas fa-exclamation-circle me-2"></i>
                          {apiError}
                        </div>
                      )}

                      <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                          <label
                            htmlFor="currentPassword"
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            كلمة المرور الحالية
                          </label>
                          <input
                            type="password"
                            className={`form-control ${
                              passwordErrors.currentPassword ? "is-invalid" : ""
                            }`}
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="أدخل كلمة المرور الحالية"
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: passwordErrors.currentPassword
                                ? "var(--karate-error)"
                                : "var(--karate-border)",
                            }}
                          />
                          {passwordErrors.currentPassword && (
                            <div
                              className="invalid-feedback"
                              style={{ color: "var(--karate-error)" }}
                            >
                              {passwordErrors.currentPassword}
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label
                            htmlFor="newPassword"
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            كلمة المرور الجديدة
                          </label>
                          <input
                            type="password"
                            className={`form-control ${
                              passwordErrors.newPassword ? "is-invalid" : ""
                            }`}
                            id="newPassword"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: passwordErrors.newPassword
                                ? "var(--karate-error)"
                                : "var(--karate-border)",
                            }}
                          />
                          {passwordErrors.newPassword && (
                            <div
                              className="invalid-feedback"
                              style={{ color: "var(--karate-error)" }}
                            >
                              {passwordErrors.newPassword}
                            </div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label"
                            style={{ color: "var(--karate-text)" }}
                          >
                            تأكيد كلمة المرور الجديدة
                          </label>
                          <input
                            type="password"
                            className={`form-control ${
                              passwordErrors.confirmPassword ? "is-invalid" : ""
                            }`}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="أكد كلمة المرور الجديدة"
                            style={{
                              backgroundColor: "var(--karate-background)",
                              color: "var(--karate-text)",
                              borderColor: passwordErrors.confirmPassword
                                ? "var(--karate-error)"
                                : "var(--karate-border)",
                            }}
                          />
                          {passwordErrors.confirmPassword && (
                            <div
                              className="invalid-feedback"
                              style={{ color: "var(--karate-error)" }}
                            >
                              {passwordErrors.confirmPassword}
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="btn"
                          disabled={isLoading}
                          style={{
                            backgroundColor: "var(--karate-primary)",
                            color: "white",
                            padding: "0.5rem 1.5rem",
                            borderRadius: "6px",
                          }}
                        >
                          {isLoading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              جاري تغيير كلمة المرور...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-lock me-2"></i>
                              تغيير كلمة المرور
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* {activeTab === "notifications" && (
                    <div>
                      <h3
                        className="h5 mb-4"
                        style={{ color: "var(--karate-text)" }}
                      >
                        إعدادات الإشعارات
                      </h3>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          defaultChecked
                          style={{
                            backgroundColor: "var(--karate-background)",
                            borderColor: "var(--karate-border)",
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="emailNotifications"
                          style={{ color: "var(--karate-text)" }}
                        >
                          الإشعارات عبر البريد الإلكتروني
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          defaultChecked
                          style={{
                            backgroundColor: "var(--karate-background)",
                            borderColor: "var(--karate-border)",
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="pushNotifications"
                          style={{ color: "var(--karate-text)" }}
                        >
                          الإشعارات التلقائية
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="newsletter"
                          style={{
                            backgroundColor: "var(--karate-background)",
                            borderColor: "var(--karate-border)",
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="newsletter"
                          style={{ color: "var(--karate-text)" }}
                        >
                          النشرة الإخبارية
                        </label>
                      </div>
                      <button
                        className="btn mt-3"
                        style={{
                          backgroundColor: "var(--karate-primary)",
                          color: "white",
                        }}
                      >
                        حفظ التغييرات
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
