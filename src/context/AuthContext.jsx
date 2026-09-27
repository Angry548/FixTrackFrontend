import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({
  children,
}) => {
  const [usuario, setUsuario] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const cargarUsuario = async () => {
    try {
      const response =
        await api.get("/auth/me");

      setUsuario(
        response.data.data
      );
    } catch (error) {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  const login = async (
    correo,
    password
  ) => {
    const response =
      await api.post(
        "/auth/login",
        {
          correo,
          password,
        }
      );

    const usuarioAutenticado =
      response.data.data.usuario;

    setUsuario(
      usuarioAutenticado
    );

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post(
        "/auth/logout"
      );
    } finally {
      setUsuario(null);
    }
  };

  useEffect(() => {
    cargarUsuario();
  }, []);

  const estaAutenticado =
    Boolean(usuario);

  const empleadoId =
    useMemo(() => {
      if (!usuario?.empleadoId) {
        return null;
      }

      if (
        typeof usuario.empleadoId ===
        "object"
      ) {
        return (
          usuario.empleadoId._id ||
          null
        );
      }

      return usuario.empleadoId;
    }, [usuario]);

  const tieneRol = (...roles) => {
    if (!usuario) {
      return false;
    }

    return roles.includes(
      usuario.rol
    );
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        empleadoId,
        cargando,
        estaAutenticado,
        login,
        logout,
        cargarUsuario,
        tieneRol,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider"
    );
  }

  return context;
};