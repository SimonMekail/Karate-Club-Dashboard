import { Navigate, Route, Routes } from "react-router-dom";
import { AuthData } from "../../auth/AuthWrapper";
import { NotFound } from "../../pages/NotFound";
import { nav } from "./navigation";

export const RenderRoutes = () => {
  const { user } = AuthData();

  return (
    <Routes>
      {nav.map((route) => {
        if (route.isPrivate) {
          if (!user.isAuthenticated) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Navigate to="/login" />}
              />
            );
          }
        }
        return (
          <Route key={route.path} path={route.path} element={route.element} />
        );
      })}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
