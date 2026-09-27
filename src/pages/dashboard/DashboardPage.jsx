import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  Warehouse,
  Wrench,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const estadoInicial = {
  empresas: [],
  departamentos: [],
  areas: [],
  empleados: [],
  categoriasRecursos: [],
  recursos: [],
  gruposRecursos: [],
  proveedores: [],
  categoriasAjustes: [],
  ajustesInventario: [],
  mantenimientos: [],
  usuarios: [],
};

const DashboardPage = () => {
  const {
    usuario,
    empleadoId,
  } = useAuth();

  const [cargando, setCargando] =
    useState(true);

  const [datos, setDatos] =
    useState(estadoInicial);

  const extraerData = (
    response
  ) => {
    const data =
      response?.data?.data ??
      response?.data ??
      [];

    return Array.isArray(data)
      ? data
      : [];
  };

  const obtenerPeticiones =
    () => {
      const rol =
        usuario?.rol;

      if (
        rol ===
        "administrador"
      ) {
        return [
          {
            key: "empresas",
            request:
              api.get(
                "/empresas"
              ),
          },
          {
            key:
              "departamentos",
            request:
              api.get(
                "/departamentos"
              ),
          },
          {
            key: "areas",
            request:
              api.get(
                "/areas"
              ),
          },
          {
            key:
              "empleados",
            request:
              api.get(
                "/empleados"
              ),
          },
          {
            key:
              "categoriasRecursos",
            request:
              api.get(
                "/categorias-recursos"
              ),
          },
          {
            key: "recursos",
            request:
              api.get(
                "/recursos"
              ),
          },
          {
            key:
              "gruposRecursos",
            request:
              api.get(
                "/grupos-recursos"
              ),
          },
          {
            key:
              "proveedores",
            request:
              api.get(
                "/proveedores"
              ),
          },
          {
            key:
              "categoriasAjustes",
            request:
              api.get(
                "/categorias-ajustes"
              ),
          },
          {
            key:
              "ajustesInventario",
            request:
              api.get(
                "/ajustes-inventario"
              ),
          },
          {
            key:
              "mantenimientos",
            request:
              api.get(
                "/mantenimientos"
              ),
          },
          {
            key: "usuarios",
            request:
              api.get(
                "/usuarios"
              ),
          },
        ];
      }

      if (
        rol === "inventario"
      ) {
        return [
          {
            key:
              "categoriasRecursos",
            request:
              api.get(
                "/categorias-recursos"
              ),
          },
          {
            key: "recursos",
            request:
              api.get(
                "/recursos"
              ),
          },
          {
            key:
              "gruposRecursos",
            request:
              api.get(
                "/grupos-recursos"
              ),
          },
          {
            key:
              "proveedores",
            request:
              api.get(
                "/proveedores"
              ),
          },
          {
            key:
              "categoriasAjustes",
            request:
              api.get(
                "/categorias-ajustes"
              ),
          },
          {
            key:
              "ajustesInventario",
            request:
              api.get(
                "/ajustes-inventario"
              ),
          },
        ];
      }

      if (
        rol === "tecnico"
      ) {
        if (!empleadoId) {
          return [];
        }

        return [
          {
            key:
              "mantenimientos",
            request:
              api.get(
                "/mantenimientos",
                {
                  params: {
                    tecnicoAsignadoId:
                      empleadoId,
                  },
                }
              ),
          },
          {
            key: "recursos",
            request:
              api.get(
                "/recursos"
              ),
          },
        ];
      }

      return [
        {
          key: "empresas",
          request:
            api.get(
              "/empresas"
            ),
        },
        {
          key:
            "departamentos",
          request:
            api.get(
              "/departamentos"
            ),
        },
        {
          key: "areas",
          request:
            api.get(
              "/areas"
            ),
        },
        {
          key:
            "empleados",
          request:
            api.get(
              "/empleados"
            ),
        },
        {
          key:
            "recursos",
          request:
            api.get(
              "/recursos"
            ),
        },
        {
          key:
            "proveedores",
          request:
            api.get(
              "/proveedores"
            ),
        },
        {
          key:
            "ajustesInventario",
          request:
            api.get(
              "/ajustes-inventario"
            ),
        },
        {
          key:
            "mantenimientos",
          request:
            api.get(
              "/mantenimientos"
            ),
        },
      ];
    };

  const cargarDashboard =
    async () => {
      try {
        setCargando(true);

        const peticiones =
          obtenerPeticiones();

        if (
          usuario?.rol ===
            "tecnico" &&
          !empleadoId
        ) {
          setDatos(
            estadoInicial
          );

          toast.error(
            "El usuario técnico no tiene un empleado vinculado"
          );

          return;
        }

        const resultados =
          await Promise.allSettled(
            peticiones.map(
              (item) =>
                item.request
            )
          );

        const nuevosDatos = {
          ...estadoInicial,
        };

        resultados.forEach(
          (
            resultado,
            index
          ) => {
            const key =
              peticiones[
                index
              ].key;

            if (
              resultado.status ===
              "fulfilled"
            ) {
              nuevosDatos[key] =
                extraerData(
                  resultado.value
                );
            }
          }
        );

        setDatos(
          nuevosDatos
        );

        const fallidas =
          resultados.filter(
            (resultado) =>
              resultado.status ===
              "rejected"
          );

        if (
          fallidas.length > 0
        ) {
          toast.error(
            "Algunos datos del dashboard no pudieron cargarse"
          );
        }
      } catch (error) {
        toast.error(
          "No se pudo cargar el dashboard"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    if (!usuario) {
      return;
    }

    cargarDashboard();
  }, [
    usuario?.rol,
    empleadoId,
  ]);

  const estadisticasInventario =
    useMemo(() => {
      return datos.recursos.reduce(
        (
          acumulador,
          recurso
        ) => {
          const total =
            Number(
              recurso.existenciaTotal
            ) || 0;

          const prestados =
            Number(
              recurso.cantidadPrestada
            ) || 0;

          const reparacion =
            Number(
              recurso.cantidadEnReparacion
            ) || 0;

          const desecho =
            Number(
              recurso.cantidadDesecho
            ) || 0;

          const disponible =
            Math.max(
              0,
              total -
                prestados -
                reparacion -
                desecho
            );

          acumulador.total +=
            total;

          acumulador.prestados +=
            prestados;

          acumulador.reparacion +=
            reparacion;

          acumulador.desecho +=
            desecho;

          acumulador.disponible +=
            disponible;

          return acumulador;
        },
        {
          total: 0,
          disponible: 0,
          prestados: 0,
          reparacion: 0,
          desecho: 0,
        }
      );
    }, [datos.recursos]);

  const estadisticasMantenimiento =
    useMemo(() => {
      return datos.mantenimientos.reduce(
        (
          acumulador,
          mantenimiento
        ) => {
          if (
            mantenimiento.estado &&
            acumulador[
              mantenimiento.estado
            ] !== undefined
          ) {
            acumulador[
              mantenimiento.estado
            ] += 1;
          }

          return acumulador;
        },
        {
          notificado: 0,
          programado: 0,
          en_proceso: 0,
          corregido: 0,
        }
      );
    }, [
      datos.mantenimientos,
    ]);

  const mantenimientosRecientes =
    useMemo(() => {
      return [
        ...datos.mantenimientos,
      ]
        .sort((a, b) => {
          const fechaA =
            new Date(
              a.createdAt ||
                a.fechaCreacion ||
                0
            ).getTime();

          const fechaB =
            new Date(
              b.createdAt ||
                b.fechaCreacion ||
                0
            ).getTime();

          return (
            fechaB -
            fechaA
          );
        })
        .slice(0, 5);
    }, [
      datos.mantenimientos,
    ]);

  const ajustesRecientes =
    useMemo(() => {
      return [
        ...datos.ajustesInventario,
      ]
        .sort((a, b) => {
          const fechaA =
            new Date(
              a.fecha ||
                a.createdAt ||
                0
            ).getTime();

          const fechaB =
            new Date(
              b.fecha ||
                b.createdAt ||
                0
            ).getTime();

          return (
            fechaB -
            fechaA
          );
        })
        .slice(0, 5);
    }, [
      datos.ajustesInventario,
    ]);

  const recursosTecnico =
    useMemo(() => {
      if (
        usuario?.rol !==
        "tecnico"
      ) {
        return [];
      }

      const ids =
        new Set(
          datos.mantenimientos
            .map(
              (
                mantenimiento
              ) => {
                if (
                  mantenimiento.recursoId &&
                  typeof mantenimiento.recursoId ===
                    "object"
                ) {
                  return mantenimiento
                    .recursoId
                    ._id;
                }

                return mantenimiento.recursoId;
              }
            )
            .filter(Boolean)
        );

      return datos.recursos.filter(
        (recurso) =>
          ids.has(
            recurso._id
          )
      );
    }, [
      usuario?.rol,
      datos.mantenimientos,
      datos.recursos,
    ]);

  const etiquetaRol = (
    rol
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
      roles[rol] ||
      rol
    );
  };

  const tituloDashboard =
    () => {
      if (
        usuario?.rol ===
        "administrador"
      ) {
        return (
          "Dashboard general"
        );
      }

      if (
        usuario?.rol ===
        "inventario"
      ) {
        return (
          "Dashboard de inventario"
        );
      }

      if (
        usuario?.rol ===
        "tecnico"
      ) {
        return (
          "Dashboard técnico"
        );
      }

      return (
        "Dashboard de consulta"
      );
    };

  const descripcionDashboard =
    () => {
      if (
        usuario?.rol ===
        "administrador"
      ) {
        return "Resumen general de FixTrack.";
      }

      if (
        usuario?.rol ===
        "inventario"
      ) {
        return "Resumen del estado actual del inventario.";
      }

      if (
        usuario?.rol ===
        "tecnico"
      ) {
        return "Seguimiento de los mantenimientos que tiene asignados.";
      }

      return "Resumen de información disponible en modo consulta.";
    };

  const obtenerNombreRecurso =
    (mantenimiento) => {
      if (
        mantenimiento.recursoId &&
        typeof mantenimiento.recursoId ===
          "object"
      ) {
        return (
          mantenimiento
            .recursoId
            .nombre ||
          "Recurso"
        );
      }

      const recurso =
        datos.recursos.find(
          (item) =>
            item._id ===
            mantenimiento.recursoId
        );

      return (
        recurso?.nombre ||
        "Recurso"
      );
    };

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return "—";
    }

    return new Date(
      fecha
    ).toLocaleDateString(
      "es-SV"
    );
  };

  const etiquetaEstado = (
    estado
  ) => {
    const estados = {
      notificado:
        "Notificado",
      programado:
        "Programado",
      en_proceso:
        "En proceso",
      corregido:
        "Corregido",
    };

    return (
      estados[estado] ||
      estado ||
      "Sin estado"
    );
  };

  const mostrarInventario = [
    "administrador",
    "inventario",
    "consulta",
  ].includes(
    usuario?.rol
  );

  const mostrarMantenimiento = [
    "administrador",
    "tecnico",
    "consulta",
  ].includes(
    usuario?.rol
  );

  const mostrarOrganizacion = [
    "administrador",
    "consulta",
  ].includes(
    usuario?.rol
  );

  if (cargando) {
    return (
      <section className="dashboard-page">
        <div className="dashboard-loading">
          <RefreshCw
            size={34}
            className="dashboard-spinner"
          />

          <strong>
            Cargando dashboard...
          </strong>

          <span>
            Consultando información de FixTrack
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            {tituloDashboard()}
          </span>

          <h1>
            Bienvenido,{" "}
            {usuario?.nombre ||
              "Usuario"}
          </h1>

          <p>
            {descripcionDashboard()}
          </p>

          <div className="dashboard-user-role">
            <ShieldCheck
              size={15}
            />

            {etiquetaRol(
              usuario?.rol
            )}
          </div>
        </div>

        <button
          type="button"
          className="button-secondary dashboard-refresh"
          onClick={
            cargarDashboard
          }
        >
          <RefreshCw
            size={18}
          />
          Actualizar panel
        </button>
      </div>

      {mostrarInventario && (
        <>
          <div className="dashboard-main-stats">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon resources">
                <Boxes
                  size={23}
                />
              </div>

              <div>
                <span>
                  Recursos
                </span>

                <strong>
                  {
                    datos.recursos
                      .length
                  }
                </strong>

                <small>
                  Tipos registrados
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon stock">
                <Warehouse
                  size={23}
                />
              </div>

              <div>
                <span>
                  Existencia total
                </span>

                <strong>
                  {
                    estadisticasInventario.total
                  }
                </strong>

                <small>
                  Unidades registradas
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon available">
                <PackageCheck
                  size={23}
                />
              </div>

              <div>
                <span>
                  Disponibles
                </span>

                <strong>
                  {
                    estadisticasInventario.disponible
                  }
                </strong>

                <small>
                  Unidades disponibles
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon assignments">
                <PackageOpen
                  size={23}
                />
              </div>

              <div>
                <span>
                  Prestados
                </span>

                <strong>
                  {
                    estadisticasInventario.prestados
                  }
                </strong>

                <small>
                  Unidades asignadas
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon maintenance">
                <Wrench
                  size={23}
                />
              </div>

              <div>
                <span>
                  En reparación
                </span>

                <strong>
                  {
                    estadisticasInventario.reparacion
                  }
                </strong>

                <small>
                  Unidades en proceso
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <TriangleAlert
                  size={23}
                />
              </div>

              <div>
                <span>
                  Desecho
                </span>

                <strong>
                  {
                    estadisticasInventario.desecho
                  }
                </strong>

                <small>
                  Unidades dadas de baja
                </small>
              </div>
            </article>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card inventory-overview-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>
                    Estado del inventario
                  </h2>

                  <p>
                    Distribución actual de unidades
                  </p>
                </div>

                <Warehouse
                  size={21}
                />
              </div>

              <div className="inventory-overview">
                <div className="inventory-overview-item">
                  <div>
                    <span>
                      Disponibles
                    </span>

                    <strong>
                      {
                        estadisticasInventario.disponible
                      }
                    </strong>
                  </div>
                </div>

                <div className="inventory-overview-item">
                  <div>
                    <span>
                      Prestados
                    </span>

                    <strong>
                      {
                        estadisticasInventario.prestados
                      }
                    </strong>
                  </div>
                </div>

                <div className="inventory-overview-item">
                  <div>
                    <span>
                      En reparación
                    </span>

                    <strong>
                      {
                        estadisticasInventario.reparacion
                      }
                    </strong>
                  </div>
                </div>

                <div className="inventory-overview-item">
                  <div>
                    <span>
                      Desecho
                    </span>

                    <strong>
                      {
                        estadisticasInventario.desecho
                      }
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>
                    Ajustes recientes
                  </h2>

                  <p>
                    Últimos movimientos de inventario
                  </p>
                </div>

                <ClipboardList
                  size={21}
                />
              </div>

              {ajustesRecientes.length ===
              0 ? (
                <div className="dashboard-empty">
                  <ClipboardList
                    size={30}
                  />

                  <span>
                    No hay ajustes recientes.
                  </span>
                </div>
              ) : (
                <div className="dashboard-list">
                  {ajustesRecientes.map(
                    (ajuste) => (
                      <div
                        key={
                          ajuste._id
                        }
                        className="dashboard-list-item"
                      >
                        <div className="dashboard-list-icon adjustments">
                          <ClipboardList
                            size={
                              17
                            }
                          />
                        </div>

                        <div className="dashboard-list-content">
                          <strong>
                            {ajuste.numeroDocumento ||
                              "Sin documento"}
                          </strong>

                          <span>
                            {formatearFecha(
                              ajuste.fecha ||
                                ajuste.createdAt
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {mostrarMantenimiento && (
        <>
          <div className="dashboard-main-stats">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon maintenance">
                <Wrench
                  size={23}
                />
              </div>

              <div>
                <span>
                  {usuario?.rol ===
                  "tecnico"
                    ? "Mis mantenimientos"
                    : "Mantenimientos"}
                </span>

                <strong>
                  {
                    datos
                      .mantenimientos
                      .length
                  }
                </strong>

                <small>
                  Registros
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <Clock3
                  size={23}
                />
              </div>

              <div>
                <span>
                  Notificados
                </span>

                <strong>
                  {
                    estadisticasMantenimiento.notificado
                  }
                </strong>

                <small>
                  Pendientes
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon maintenance">
                <Wrench
                  size={23}
                />
              </div>

              <div>
                <span>
                  En proceso
                </span>

                <strong>
                  {
                    estadisticasMantenimiento.en_proceso
                  }
                </strong>

                <small>
                  Atención activa
                </small>
              </div>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon available">
                <CheckCircle2
                  size={23}
                />
              </div>

              <div>
                <span>
                  Corregidos
                </span>

                <strong>
                  {
                    estadisticasMantenimiento.corregido
                  }
                </strong>

                <small>
                  Finalizados
                </small>
              </div>
            </article>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>
                    {usuario?.rol ===
                    "tecnico"
                      ? "Mis mantenimientos recientes"
                      : "Mantenimientos recientes"}
                  </h2>

                  <p>
                    Últimos registros
                  </p>
                </div>

                <Wrench
                  size={21}
                />
              </div>

              {mantenimientosRecientes.length ===
              0 ? (
                <div className="dashboard-empty success">
                  <CheckCircle2
                    size={30}
                  />

                  <span>
                    No hay mantenimientos pendientes.
                  </span>
                </div>
              ) : (
                <div className="dashboard-list">
                  {mantenimientosRecientes.map(
                    (
                      mantenimiento
                    ) => (
                      <div
                        key={
                          mantenimiento._id
                        }
                        className="dashboard-list-item"
                      >
                        <div className="dashboard-list-icon">
                          <Wrench
                            size={
                              17
                            }
                          />
                        </div>

                        <div className="dashboard-list-content">
                          <strong>
                            {obtenerNombreRecurso(
                              mantenimiento
                            )}
                          </strong>

                          <span>
                            {formatearFecha(
                              mantenimiento.fechaCreacion ||
                                mantenimiento.createdAt
                            )}
                          </span>
                        </div>

                        <span
                          className={`maintenance-status ${mantenimiento.estado}`}
                        >
                          {etiquetaEstado(
                            mantenimiento.estado
                          )}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {usuario?.rol ===
              "tecnico" && (
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div>
                    <h2>
                      Recursos relacionados
                    </h2>

                    <p>
                      Recursos presentes en tus mantenimientos
                    </p>
                  </div>

                  <Boxes
                    size={21}
                  />
                </div>

                {recursosTecnico.length ===
                0 ? (
                  <div className="dashboard-empty">
                    <Boxes
                      size={30}
                    />

                    <span>
                      No hay recursos relacionados.
                    </span>
                  </div>
                ) : (
                  <div className="dashboard-list">
                    {recursosTecnico
                      .slice(0, 5)
                      .map(
                        (
                          recurso
                        ) => (
                          <div
                            key={
                              recurso._id
                            }
                            className="dashboard-list-item"
                          >
                            <div className="dashboard-list-icon">
                              <Boxes
                                size={
                                  17
                                }
                              />
                            </div>

                            <div className="dashboard-list-content">
                              <strong>
                                {
                                  recurso.nombre
                                }
                              </strong>

                              <span>
                                {
                                  recurso.codigo
                                }
                              </span>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {mostrarOrganizacion && (
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>
                Resumen del sistema
              </h2>

              <p>
                Registros principales de FixTrack
              </p>
            </div>

            <Building2
              size={21}
            />
          </div>

          <div className="system-summary-grid">
            <div>
              <Building2
                size={18}
              />

              <span>
                Empresas
              </span>

              <strong>
                {
                  datos.empresas
                    .length
                }
              </strong>
            </div>

            <div>
              <Warehouse
                size={18}
              />

              <span>
                Departamentos
              </span>

              <strong>
                {
                  datos
                    .departamentos
                    .length
                }
              </strong>
            </div>

            <div>
              <Boxes
                size={18}
              />

              <span>
                Áreas
              </span>

              <strong>
                {
                  datos.areas
                    .length
                }
              </strong>
            </div>

            <div>
              <UsersRound
                size={18}
              />

              <span>
                Empleados
              </span>

              <strong>
                {
                  datos
                    .empleados
                    .length
                }
              </strong>
            </div>

            <div>
              <Warehouse
                size={18}
              />

              <span>
                Proveedores
              </span>

              <strong>
                {
                  datos
                    .proveedores
                    .length
                }
              </strong>
            </div>

            {usuario?.rol ===
              "administrador" && (
              <div>
                <ShieldCheck
                  size={18}
                />

                <span>
                  Usuarios
                </span>

                <strong>
                  {
                    datos
                      .usuarios
                      .length
                  }
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardPage;