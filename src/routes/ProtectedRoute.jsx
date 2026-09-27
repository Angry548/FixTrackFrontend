import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = () => {
  const {
    estaAutenticado,
    cargando,
  } = useAuth();

  if (cargando) {
    return (
      <div className="loading-screen">
        Cargando FixTrack...
      </div>
    );
  }

  if (!estaAutenticado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;