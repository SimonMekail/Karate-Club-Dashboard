import { useState } from "react";
import { AuthData } from "../auth/AuthWrapper";
import BouncingDots from "../components/Spinner/BouncingDots";
import styles from "../styles/LoginPageStyle.module.css";

export const Login = () => {
  const { login } = AuthData();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await login(userName, password);
      if (response && !response.success) {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage("حدث خطأ اثناء تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <i className="fas fa-hand-fist"></i>
            <div className={styles.logoPulse}></div>
          </div>
          <h1 className={styles.title}>نادي الكاراتيه</h1>
          <p className={styles.subtitle}>
            أدخل بيانات الاعتماد الخاصة بك للمتابعة
          </p>
          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <input
              type="text"
              className={styles.input}
              id="username"
              placeholder=" "
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <label htmlFor="username" className={styles.label}>
              اسم المستخدم
            </label>
            <i className={`fas fa-user ${styles.icon}`}></i>
          </div>

          <div className={styles.formGroup}>
            <input
              type="password"
              className={styles.input}
              id="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password" className={styles.label}>
              كلمة المرور
            </label>
            <i className={`fas fa-lock ${styles.icon}`}></i>
          </div>

          <div className={styles.separator}>
            <span className={styles.separatorLine}></span>
            <span className={styles.separatorIcon}>
              <i className="fas fa-hand-fist"></i>
            </span>
            <span className={styles.separatorLine}></span>
          </div>

          {isLoading ? (
            <BouncingDots />
          ) : (
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
            >
              تسجيل الدخول
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
