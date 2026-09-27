import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage.jsx";
import DashboardPage from "./pages/dashboard/DashboardPage.jsx";

import EmpresasPage from "./pages/empresas/EmpresasPage.jsx";
import DepartamentosPage from "./pages/departamentos/DepartamentosPage.jsx";
import AreasPage from "./pages/areas/AreasPage.jsx";
import EmpleadosPage from "./pages/empleados/EmpleadosPage.jsx";

import CategoriasRecursosPage from "./pages/categorias-recursos/CategoriasRecursosPage.jsx";
import RecursosPage from "./pages/recursos/RecursosPage.jsx";
import GruposRecursosPage from "./pages/grupos-recursos/GruposRecursosPage.jsx";

import ProveedoresPage from "./pages/proveedores/ProveedoresPage.jsx";
import CategoriasAjustesPage from "./pages/categorias-ajustes/CategoriasAjustesPage.jsx";
import AjustesInventarioPage from "./pages/ajustes-inventario/AjustesInventarioPage.jsx";

import MantenimientosPage from "./pages/mantenimientos/MantenimientosPage.jsx";
import UsuariosPage from "./pages/usuarios/UsuariosPage.jsx";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleRoute from "./routes/RoleRoute.jsx";

import MainLayout from "./layouts/MainLayout.jsx";

const App = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route
            index
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            element={
              <RoleRoute
                rolesPermitidos={[
                  "administrador",
                  "consulta",
                ]}
              />
            }
          >
            <Route
              path="/empresas"
              element={<EmpresasPage />}
            />

            <Route
              path="/departamentos"
              element={<DepartamentosPage />}
            />

            <Route
              path="/areas"
              element={<AreasPage />}
            />

            <Route
              path="/empleados"
              element={<EmpleadosPage />}
            />
          </Route>

          <Route
            element={
              <RoleRoute
                rolesPermitidos={[
                  "administrador",
                  "inventario",
                  "consulta",
                ]}
              />
            }
          >
            <Route
              path="/categorias-recursos"
              element={
                <CategoriasRecursosPage />
              }
            />

            <Route
              path="/recursos"
              element={<RecursosPage />}
            />

            <Route
              path="/grupos-recursos"
              element={
                <GruposRecursosPage />
              }
            />

            <Route
              path="/proveedores"
              element={<ProveedoresPage />}
            />

            <Route
              path="/categorias-ajustes"
              element={
                <CategoriasAjustesPage />
              }
            />

            <Route
              path="/ajustes-inventario"
              element={
                <AjustesInventarioPage />
              }
            />
          </Route>

          <Route
            element={
              <RoleRoute
                rolesPermitidos={[
                  "administrador",
                  "tecnico",
                  "consulta",
                ]}
              />
            }
          >
            <Route
              path="/mantenimientos"
              element={
                <MantenimientosPage />
              }
            />
          </Route>

          <Route
            element={
              <RoleRoute
                rolesPermitidos={[
                  "tecnico",
                ]}
              />
            }
          >
            <Route
              path="/mis-mantenimientos"
              element={
                <MantenimientosPage modo="mios" />
              }
            />

            <Route
              path="/recursos-relacionados"
              element={
                <RecursosPage modo="relacionados" />
              }
            />
          </Route>

          <Route
            element={
              <RoleRoute
                rolesPermitidos={[
                  "administrador",
                ]}
              />
            }
          >
            <Route
              path="/usuarios"
              element={<UsuariosPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;