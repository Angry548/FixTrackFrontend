import {
  Navigate,
  Outlet,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const RoleRoute = ({
  rolesPermitidos = [],
}) => {
  const {
    usuario,
    cargando,
  } = useAuth();

  if (cargando) {
    return (
      <div className="loading-screen">
        Verificando permisos...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !rolesPermitidos.includes(
      usuario.rol
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;