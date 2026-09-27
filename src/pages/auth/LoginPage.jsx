import { useState } from "react";
import {
  Navigate,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();

  const {
    login,
    estaAutenticado,
  } = useAuth();

  const [correo, setCorreo] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [cargando, setCargando] =
    useState(false);

  if (estaAutenticado) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!correo || !password) {
      toast.error(
        "Ingrese correo y contraseña"
      );

      return;
    }

    try {
      setCargando(true);

      await login(
        correo,
        password
      );

      toast.success(
        "Inicio de sesión exitoso"
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        "No se pudo iniciar sesión";

      toast.error(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>FixTrack</h1>

          <p>
            Sistema de Gestión de Incidencias
            e Inventario
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div className="form-group">
            <label htmlFor="correo">
              Correo electrónico
            </label>

            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(event) =>
                setCorreo(event.target.value)
              }
              placeholder="admin@fixtrack.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <div className="password-container">
              <input
                id="password"
                type={
                  mostrarPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setMostrarPassword(
                    !mostrarPassword
                  )
                }
              >
                {mostrarPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            <LogIn size={20} />

            {cargando
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;