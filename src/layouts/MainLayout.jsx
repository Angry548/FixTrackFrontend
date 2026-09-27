import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  Boxes,
  Building2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Factory,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Settings2,
  ShieldCheck,
  Tags,
  UserRound,
  UsersRound,
  Warehouse,
  Wrench,
} from "lucide-react";

import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";

const MainLayout = () => {
  const {
    usuario,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const rol =
    usuario?.rol;

  const cerrarSesion =
    async () => {
      try {
        await logout();

        toast.success(
          "Sesión cerrada correctamente"
        );

        navigate(
          "/login",
          {
            replace: true,
          }
        );
      } catch (error) {
        toast.error(
          "No se pudo cerrar la sesión"
        );
      }
    };

  const etiquetaRol = (
    valor
  ) => {
    const roles = {
      administrador:
        "Administrador",
      inventario:
        "Inventario",
      tecnico:
        "Técnico",
      consulta:
        "Consulta",
    };

    return (
      roles[valor] ||
      valor
    );
  };

  const obtenerIniciales =
    () => {
      const nombre =
        usuario?.nombre?.trim();

      if (!nombre) {
        return "FT";
      }

      const partes =
        nombre.split(/\s+/);

      if (
        partes.length === 1
      ) {
        return partes[0]
          .slice(0, 2)
          .toUpperCase();
      }

      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    };

  const claseNav = ({
    isActive,
  }) =>
    isActive
      ? "sidebar-link active"
      : "sidebar-link";

  const puedeVer = (
    roles
  ) => {
    return roles.includes(
      rol
    );
  };

  const secciones = [
    {
      titulo: "General",
      roles: [
        "administrador",
        "inventario",
        "tecnico",
        "consulta",
      ],
      opciones: [
        {
          to: "/dashboard",
          label: "Dashboard",
          icono:
            LayoutDashboard,
          roles: [
            "administrador",
            "inventario",
            "tecnico",
            "consulta",
          ],
        },
      ],
    },
    {
      titulo: "Organización",
      roles: [
        "administrador",
        "consulta",
      ],
      opciones: [
        {
          to: "/empresas",
          label: "Empresas",
          icono: Building2,
          roles: [
            "administrador",
            "consulta",
          ],
        },
        {
          to: "/departamentos",
          label:
            "Departamentos",
          icono: Factory,
          roles: [
            "administrador",
            "consulta",
          ],
        },
        {
          to: "/areas",
          label: "Áreas",
          icono:
            FolderKanban,
          roles: [
            "administrador",
            "consulta",
          ],
        },
      ],
    },
    {
      titulo: "Personal",
      roles: [
        "administrador",
        "consulta",
      ],
      opciones: [
        {
          to: "/empleados",
          label: "Empleados",
          icono:
            UsersRound,
          roles: [
            "administrador",
            "consulta",
          ],
        },
      ],
    },
    {
      titulo: "Inventario",
      roles: [
        "administrador",
        "inventario",
        "consulta",
      ],
      opciones: [
        {
          to:
            "/categorias-recursos",
          label:
            "Categorías",
          icono: Tags,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
        {
          to: "/recursos",
          label: "Recursos",
          icono: Boxes,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
        {
          to:
            "/grupos-recursos",
          label:
            "Grupos de recursos",
          icono:
            PackageSearch,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
        {
          to: "/proveedores",
          label:
            "Proveedores",
          icono:
            Warehouse,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
      ],
    },
    {
      titulo: "Movimientos",
      roles: [
        "administrador",
        "inventario",
        "consulta",
      ],
      opciones: [
        {
          to:
            "/categorias-ajustes",
          label:
            "Categorías de ajustes",
          icono:
            Settings2,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
        {
          to:
            "/ajustes-inventario",
          label:
            "Ajustes de inventario",
          icono:
            ClipboardList,
          roles: [
            "administrador",
            "inventario",
            "consulta",
          ],
        },
      ],
    },
    {
      titulo: "Soporte",
      roles: [
        "administrador",
        "tecnico",
        "consulta",
      ],
      opciones: [
        {
          to:
            "/mantenimientos",
          label:
            "Mantenimientos",
          icono: Wrench,
          roles: [
            "administrador",
            "tecnico",
            "consulta",
          ],
        },
        {
          to:
            "/mis-mantenimientos",
          label:
            "Mis mantenimientos",
          icono:
            ClipboardCheck,
          roles: [
            "tecnico",
          ],
        },
        {
          to:
            "/recursos-relacionados",
          label:
            "Recursos relacionados",
          icono: Boxes,
          roles: [
            "tecnico",
          ],
        },
      ],
    },
    {
      titulo:
        "Administración",
      roles: [
        "administrador",
      ],
      opciones: [
        {
          to: "/usuarios",
          label: "Usuarios",
          icono:
            ShieldCheck,
          roles: [
            "administrador",
          ],
        },
      ],
    },
  ];

  const resumenRol = () => {
    if (
      rol ===
      "administrador"
    ) {
      return (
        "Administración general"
      );
    }

    if (
      rol ===
      "inventario"
    ) {
      return (
        "Gestión de inventario"
      );
    }

    if (
      rol === "tecnico"
    ) {
      return (
        "Gestión técnica"
      );
    }

    return "Solo consulta";
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Wrench size={22} />
          </div>

          <div>
            <strong>
              FixTrack
            </strong>

            <span>
              Gestión de recursos
            </span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {obtenerIniciales()}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {usuario?.nombre ||
                "Usuario"}
            </strong>

            <span>
              {etiquetaRol(
                usuario?.rol
              )}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {secciones
            .filter(
              (seccion) =>
                puedeVer(
                  seccion.roles
                )
            )
            .map(
              (seccion) => {
                const opcionesVisibles =
                  seccion.opciones.filter(
                    (opcion) =>
                      puedeVer(
                        opcion.roles
                      )
                  );

                if (
                  opcionesVisibles.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <div
                    className="sidebar-section"
                    key={
                      seccion.titulo
                    }
                  >
                    <span className="sidebar-section-title">
                      {
                        seccion.titulo
                      }
                    </span>

                    {opcionesVisibles.map(
                      (opcion) => {
                        const Icono =
                          opcion.icono;

                        return (
                          <NavLink
                            key={
                              opcion.to
                            }
                            to={
                              opcion.to
                            }
                            className={
                              claseNav
                            }
                          >
                            <Icono
                              size={
                                18
                              }
                            />

                            <span>
                              {
                                opcion.label
                              }
                            </span>

                            <ChevronRight
                              size={
                                15
                              }
                              className="sidebar-link-arrow"
                            />
                          </NavLink>
                        );
                      }
                    )}
                  </div>
                );
              }
            )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-permission-summary">
            <UserRound
              size={16}
            />

            <span>
              {resumenRol()}
            </span>
          </div>

          <button
            type="button"
            className="sidebar-logout"
            onClick={
              cerrarSesion
            }
          >
            <LogOut
              size={18}
            />

            <span>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;