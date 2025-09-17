import { createContext, useContext, useState, useEffect } from "react";
import { RenderRoutes } from "../components/Navigation/RenderNavigation";
import { Route, Routes, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Login } from "../pages/Login";
import axios from "axios";

import { API_CONFIG } from "../config";
import Spinner from "../components/Spinner/Spinner";
import { WebSite } from "../pages/WebSite";
import MessageContainer from "../components/MessageContainer/MessageContainer";

const AuthContext = createContext();
export const AuthData = () => useContext(AuthContext);

export const AuthWrapper = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const publicRoutes = ["/login", "/OurKarateClub"];

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(location.pathname)) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const login = async (userName, password) => {
    try {
      const response = await axios.post(
        "api/Users/Login",
        { userName, password },
        {
          headers: API_CONFIG.DEFAULT_HEADERS,
        }
      );
      console.log(response);

      if (response.request.status === 200) {
        const userData = {
          userName: userName,
          isActive: response.data.user.isActive,
          password: response.data.user.password,
          personID: response.data.user.personID,
          userID: response.data.user.userID,
          name: response.data.user.personInfo.name,
          token: response.data.token,
          isAuthenticated: true,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "حدث خطأ اثناء تسجيل الدخول",
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {loading ? (
        <Spinner />
      ) : user ? (
        <>
          <RenderRoutes />
          {!publicRoutes.includes(location.pathname) ? (
            <MessageContainer
              isMessageOpen={isMessageOpen}
              setIsMessageOpen={setIsMessageOpen}
            />
          ) : null}
        </>
      ) : (
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/OurKarateClub" element={<WebSite />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </>
      )}
    </AuthContext.Provider>
  );
};
