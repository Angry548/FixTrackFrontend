import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import SearchableSelect from "../../components/common/SearchableSelect.jsx";

const estadoInicialFormulario = {
  nombre: "",
  correo: "",
  password: "",
  rol: "consulta",
  empleadoId: "",
  activo: true,
};

const filtrosIniciales = {
  nombre: "",
  correo: "",
  rol: "",
  activo: "",
};

const UsuariosPage = () => {
  const {
    usuario: usuarioSesion,
  } = useAuth();

  const esAdministrador =
    usuarioSesion?.rol ===
    "administrador";

  const [
    usuarios,
    setUsuarios,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    mostrarPassword,
    setMostrarPassword,
  ] = useState(false);

  const [
    usuarioEditando,
    setUsuarioEditando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    empleadoFormulario,
    setEmpleadoFormulario,
  ] = useState(null);

  const [
    filtros,
    setFiltros,
  ] = useState(
    filtrosIniciales
  );

  const [
    filtrosAplicados,
    setFiltrosAplicados,
  ] = useState(
    filtrosIniciales
  );

  const [
    empleadoFiltro,
    setEmpleadoFiltro,
  ] = useState(null);

  const [
    empleadoFiltroAplicado,
    setEmpleadoFiltroAplicado,
  ] = useState(null);

  const [
    paginaActual,
    setPaginaActual,
  ] = useState(1);

  const [
    registrosPorPagina,
    setRegistrosPorPagina,
  ] = useState(10);

  const [
    totalRegistros,
    setTotalRegistros,
  ] = useState(0);

  const obtenerUsuarios =
    async () => {
      if (!esAdministrador) {
        setUsuarios([]);
        setTotalRegistros(0);
        setCargando(false);

        return;
      }

      try {
        setCargando(true);

        const params = {
          page:
            paginaActual,
          limit:
            registrosPorPagina,
        };

        if (
          filtrosAplicados.nombre
            .trim()
        ) {
          params.nombre =
            filtrosAplicados.nombre.trim();
        }

        if (
          filtrosAplicados.correo
            .trim()
        ) {
          params.correo =
            filtrosAplicados.correo.trim();
        }

        if (
          filtrosAplicados.rol
        ) {
          params.rol =
            filtrosAplicados.rol;
        }

        if (
          filtrosAplicados.activo !==
          ""
        ) {
          params.activo =
            filtrosAplicados.activo;
        }

        if (
          empleadoFiltroAplicado?._id
        ) {
          params.empleadoId =
            empleadoFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/usuarios",
            {
              params,
            }
          );

        const data =
          response.data?.data ??
          response.data ??
          [];

        const registros =
          Array.isArray(data)
            ? data
            : [];

        setUsuarios(
          registros
        );

        setTotalRegistros(
          response.data
            ?.pagination
            ?.total ??
            registros.length
        );

        const totalPages =
          response.data
            ?.pagination
            ?.totalPages ??
          1;

        if (
          paginaActual >
          totalPages
        ) {
          setPaginaActual(
            totalPages
          );
        }
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudieron obtener los usuarios"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerUsuarios();
  }, [
    esAdministrador,
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    empleadoFiltroAplicado,
  ]);

  const handleFiltroChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFiltros(
        (prev) => ({
          ...prev,
          [name]: value,
        })
      );
    };

  const aplicarFiltros =
    (event) => {
      event.preventDefault();

      setPaginaActual(1);

      setFiltrosAplicados({
        ...filtros,
      });

      setEmpleadoFiltroAplicado(
        empleadoFiltro
      );
    };

  const limpiarFiltros =
    () => {
      setFiltros(
        filtrosIniciales
      );

      setFiltrosAplicados(
        filtrosIniciales
      );

      setEmpleadoFiltro(null);

      setEmpleadoFiltroAplicado(
        null
      );

      setPaginaActual(1);
    };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (
      name === "rol"
    ) {
      setFormulario(
        (prev) => ({
          ...prev,
          rol: value,
        })
      );

      return;
    }

    setFormulario(
      (prev) => ({
        ...prev,
        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  };

  const seleccionarEmpleadoFormulario =
    (empleado) => {
      setEmpleadoFormulario(
        empleado || null
      );

      setFormulario(
        (prev) => ({
          ...prev,
          empleadoId:
            empleado?._id ||
            "",
        })
      );
    };

  const abrirCrear = () => {
    setUsuarioEditando(
      null
    );

    setEmpleadoFormulario(
      null
    );

    setFormulario(
      estadoInicialFormulario
    );

    setMostrarPassword(
      false
    );

    setMostrarFormulario(
      true
    );
  };

  const abrirEditar = (
    usuario
  ) => {
    setUsuarioEditando(
      usuario
    );

    const empleado =
      usuario.empleadoId &&
      typeof usuario.empleadoId ===
        "object"
        ? usuario.empleadoId
        : null;

    setEmpleadoFormulario(
      empleado
    );

    setFormulario({
      nombre:
        usuario.nombre ||
        "",
      correo:
        usuario.correo ||
        "",
      password: "",
      rol:
        usuario.rol ||
        "consulta",
      empleadoId:
        empleado?._id ||
        usuario.empleadoId ||
        "",
      activo:
        usuario.activo !==
        false,
    });

    setMostrarPassword(
      false
    );

    setMostrarFormulario(
      true
    );
  };

  const cerrarFormulario =
    () => {
      setMostrarFormulario(
        false
      );

      setUsuarioEditando(
        null
      );

      setEmpleadoFormulario(
        null
      );

      setMostrarPassword(
        false
      );

      setFormulario(
        estadoInicialFormulario
      );
    };

  const validarFormulario =
    () => {
      if (
        !formulario.nombre.trim()
      ) {
        toast.error(
          "El nombre es obligatorio"
        );

        return false;
      }

      if (
        !formulario.correo.trim()
      ) {
        toast.error(
          "El correo es obligatorio"
        );

        return false;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formulario.correo.trim()
        )
      ) {
        toast.error(
          "Ingrese un correo válido"
        );

        return false;
      }

      if (
        !usuarioEditando &&
        !formulario.password
      ) {
        toast.error(
          "La contraseña es obligatoria"
        );

        return false;
      }

      if (
        formulario.password &&
        formulario.password.length <
          6
      ) {
        toast.error(
          "La contraseña debe tener al menos 6 caracteres"
        );

        return false;
      }

      if (
        ![
          "administrador",
          "inventario",
          "tecnico",
          "consulta",
        ].includes(
          formulario.rol
        )
      ) {
        toast.error(
          "Seleccione un rol válido"
        );

        return false;
      }

      if (
        formulario.rol ===
          "tecnico" &&
        !formulario.empleadoId
      ) {
        toast.error(
          "Los usuarios técnicos deben estar vinculados a un empleado"
        );

        return false;
      }

      return true;
    };

  const guardarUsuario =
    async (event) => {
      event.preventDefault();

      if (!esAdministrador) {
        toast.error(
          "No tiene permisos para realizar esta acción"
        );

        return;
      }

      if (
        !validarFormulario()
      ) {
        return;
      }

      try {
        setGuardando(true);

        const payload = {
          nombre:
            formulario.nombre.trim(),
          correo:
            formulario.correo
              .trim()
              .toLowerCase(),
          rol:
            formulario.rol,
          empleadoId:
            formulario.empleadoId ||
            null,
          activo:
            formulario.activo,
        };

        if (
          formulario.password
        ) {
          payload.password =
            formulario.password;
        }

        if (
          usuarioEditando
        ) {
          await api.put(
            `/usuarios/${usuarioEditando._id}`,
            payload
          );

          toast.success(
            "Usuario actualizado correctamente"
          );
        } else {
          await api.post(
            "/usuarios",
            payload
          );

          toast.success(
            "Usuario creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerUsuarios();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el usuario"
        );
      } finally {
        setGuardando(false);
      }
    };

  const cambiarEstado =
    async (usuario) => {
      if (!esAdministrador) {
        return;
      }

      if (
        usuario._id ===
        usuarioSesion?._id
      ) {
        toast.error(
          "No puede desactivar su propio usuario desde esta sesión"
        );

        return;
      }

      const nuevoEstado =
        usuario.activo ===
        false;

      const confirmar =
        window.confirm(
          `¿Desea ${
            nuevoEstado
              ? "activar"
              : "desactivar"
          } al usuario "${usuario.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.patch(
          `/usuarios/${usuario._id}/estado`,
          {
            activo:
              nuevoEstado,
          }
        );

        toast.success(
          `Usuario ${
            nuevoEstado
              ? "activado"
              : "desactivado"
          } correctamente`
        );

        await obtenerUsuarios();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo cambiar el estado"
        );
      }
    };

  const eliminarUsuario =
    async (usuario) => {
      if (!esAdministrador) {
        return;
      }

      if (
        usuario._id ===
        usuarioSesion?._id
      ) {
        toast.error(
          "No puede eliminar su propio usuario mientras tiene la sesión iniciada"
        );

        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar al usuario "${usuario.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/usuarios/${usuario._id}`
        );

        toast.success(
          "Usuario eliminado correctamente"
        );

        await obtenerUsuarios();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el usuario"
        );
      }
    };

  const obtenerNombreEmpleado =
    (usuario) => {
      if (
        usuario.empleadoId &&
        typeof usuario.empleadoId ===
          "object"
      ) {
        const empleado =
          usuario.empleadoId;

        const nombre =
          `${empleado.nombres || ""} ${
            empleado.apellidos || ""
          }`.trim();

        return (
          nombre ||
          "Empleado vinculado"
        );
      }

      return "Sin empleado vinculado";
    };

  const obtenerCodigoEmpleado =
    (usuario) => {
      if (
        usuario.empleadoId &&
        typeof usuario.empleadoId ===
          "object"
      ) {
        return (
          usuario.empleadoId
            .codigoEmpleado ||
          ""
        );
      }

      return "";
    };

  const obtenerEtiquetaRol =
    (rol) => {
      const etiquetas = {
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
        etiquetas[rol] ||
        rol
      );
    };

  const formatearFecha = (
    fecha
  ) => {
    if (!fecha) {
      return "Nunca";
    }

    return new Date(
      fecha
    ).toLocaleString(
      "es-SV"
    );
  };

  const cantidadRolPagina =
    (rol) => {
      return usuarios.filter(
        (item) =>
          item.rol === rol
      ).length;
    };

  if (!esAdministrador) {
    return (
      <section className="module-page">
        <div className="access-denied-card">
          <ShieldCheck
            size={48}
          />

          <h1>
            Acceso restringido
          </h1>

          <p>
            Este módulo está
            disponible únicamente
            para administradores.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <ShieldCheck
            size={30}
          />

          <div>
            <h1>
              Usuarios
            </h1>

            <p>
              Administración de
              cuentas, roles y
              permisos
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerUsuarios
            }
          >
            <RefreshCw
              size={18}
            />
            Actualizar
          </button>

          <button
            type="button"
            className="button-primary"
            onClick={
              abrirCrear
            }
          >
            <Plus
              size={18}
            />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="role-summary">
        <div>
          <strong>
            {cantidadRolPagina(
              "administrador"
            )}
          </strong>

          <span>
            Administradores en
            esta página
          </span>
        </div>

        <div>
          <strong>
            {cantidadRolPagina(
              "inventario"
            )}
          </strong>

          <span>
            Inventario en esta
            página
          </span>
        </div>

        <div>
          <strong>
            {cantidadRolPagina(
              "tecnico"
            )}
          </strong>

          <span>
            Técnicos en esta
            página
          </span>
        </div>

        <div>
          <strong>
            {cantidadRolPagina(
              "consulta"
            )}
          </strong>

          <span>
            Consulta en esta
            página
          </span>
        </div>
      </div>

      <div className="filters-card">
        <form
          className="filters-form"
          onSubmit={
            aplicarFiltros
          }
        >
          <div className="form-grid">
            <div className="form-group">
              <label>
                Nombre
              </label>

              <input
                name="nombre"
                type="text"
                value={
                  filtros.nombre
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar usuario"
              />
            </div>

            <div className="form-group">
              <label>
                Correo
              </label>

              <input
                name="correo"
                type="text"
                value={
                  filtros.correo
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar correo"
              />
            </div>

            <div className="form-group">
              <label>
                Rol
              </label>

              <select
                name="rol"
                value={
                  filtros.rol
                }
                onChange={
                  handleFiltroChange
                }
              >
                <option value="">
                  Todos
                </option>

                <option value="administrador">
                  Administrador
                </option>

                <option value="inventario">
                  Inventario
                </option>

                <option value="tecnico">
                  Técnico
                </option>

                <option value="consulta">
                  Consulta
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Empleado vinculado
              </label>

              <SearchableSelect
                endpoint="/empleados"
                selectedOption={
                  empleadoFiltro
                }
                onChange={
                  setEmpleadoFiltro
                }
                placeholder="Buscar empleado..."
                getOptionValue={(
                  empleado
                ) =>
                  empleado._id
                }
                getOptionLabel={(
                  empleado
                ) =>
                  `${empleado.codigoEmpleado} - ${empleado.nombres} ${empleado.apellidos}`
                }
              />
            </div>

            <div className="form-group">
              <label>
                Estado
              </label>

              <select
                name="activo"
                value={
                  filtros.activo
                }
                onChange={
                  handleFiltroChange
                }
              >
                <option value="">
                  Todos
                </option>

                <option value="true">
                  Activos
                </option>

                <option value="false">
                  Inactivos
                </option>
              </select>
            </div>
          </div>

          <div className="module-actions">
            <button
              type="submit"
              className="button-primary"
            >
              <Search
                size={17}
              />
              Buscar
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={
                limpiarFiltros
              }
            >
              <Filter
                size={17}
              />
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <div className="data-card">
        {cargando ? (
          <div className="table-message">
            Cargando usuarios...
          </div>
        ) : usuarios.length ===
          0 ? (
          <div className="table-message">
            No hay usuarios que
            coincidan con los
            filtros.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Usuario
                    </th>

                    <th>
                      Correo
                    </th>

                    <th>
                      Rol
                    </th>

                    <th>
                      Empleado
                    </th>

                    <th>
                      Último acceso
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map(
                    (usuario) => (
                      <tr
                        key={
                          usuario._id
                        }
                      >
                        <td>
                          <div className="user-name-cell">
                            <div className="user-avatar">
                              <UserRound
                                size={
                                  18
                                }
                              />
                            </div>

                            <div>
                              <strong>
                                {
                                  usuario.nombre
                                }
                              </strong>

                              {usuario._id ===
                                usuarioSesion?._id && (
                                <span>
                                  Sesión actual
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {
                            usuario.correo
                          }
                        </td>

                        <td>
                          <span
                            className={`role-badge ${usuario.rol}`}
                          >
                            {obtenerEtiquetaRol(
                              usuario.rol
                            )}
                          </span>
                        </td>

                        <td>
                          <div>
                            <strong>
                              {obtenerNombreEmpleado(
                                usuario
                              )}
                            </strong>

                            {obtenerCodigoEmpleado(
                              usuario
                            ) && (
                              <span className="muted-text">
                                {
                                  obtenerCodigoEmpleado(
                                    usuario
                                  )
                                }
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="last-login">
                            {formatearFecha(
                              usuario.ultimoAcceso
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              usuario.activo !==
                              false
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            {usuario.activo !==
                            false ? (
                              <>
                                <CheckCircle2
                                  size={
                                    14
                                  }
                                />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle
                                  size={
                                    14
                                  }
                                />
                                Inactivo
                              </>
                            )}
                          </span>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="icon-button"
                              title="Editar"
                              onClick={() =>
                                abrirEditar(
                                  usuario
                                )
                              }
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className={
                                usuario.activo !==
                                false
                                  ? "icon-button warning"
                                  : "icon-button success"
                              }
                              title={
                                usuario.activo !==
                                false
                                  ? "Desactivar"
                                  : "Activar"
                              }
                              disabled={
                                usuario._id ===
                                usuarioSesion?._id
                              }
                              onClick={() =>
                                cambiarEstado(
                                  usuario
                                )
                              }
                            >
                              {usuario.activo !==
                              false ? (
                                <XCircle
                                  size={
                                    17
                                  }
                                />
                              ) : (
                                <CheckCircle2
                                  size={
                                    17
                                  }
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              className="icon-button danger"
                              title="Eliminar"
                              disabled={
                                usuario._id ===
                                usuarioSesion?._id
                              }
                              onClick={() =>
                                eliminarUsuario(
                                  usuario
                                )
                              }
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              totalItems={
                totalRegistros
              }
              currentPage={
                paginaActual
              }
              pageSize={
                registrosPorPagina
              }
              onPageChange={
                setPaginaActual
              }
              onPageSizeChange={(
                cantidad
              ) => {
                setRegistrosPorPagina(
                  cantidad
                );

                setPaginaActual(
                  1
                );
              }}
            />
          </>
        )}
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-card modal-large">
            <div className="modal-header">
              <div>
                <h2>
                  {usuarioEditando
                    ? "Editar usuario"
                    : "Nuevo usuario"}
                </h2>

                <p>
                  {usuarioEditando
                    ? "Actualice la información, el rol y la vinculación del usuario."
                    : "Complete la información para crear una nueva cuenta de acceso."}
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={
                  cerrarFormulario
                }
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <form
              className="entity-form"
              onSubmit={
                guardarUsuario
              }
            >
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Nombre
                  </label>

                  <input
                    name="nombre"
                    type="text"
                    value={
                      formulario.nombre
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nombre del usuario"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Correo
                  </label>

                  <input
                    name="correo"
                    type="email"
                    value={
                      formulario.correo
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="usuario@fixtrack.com"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Rol
                  </label>

                  <select
                    name="rol"
                    value={
                      formulario.rol
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="administrador">
                      Administrador
                    </option>

                    <option value="inventario">
                      Inventario
                    </option>

                    <option value="tecnico">
                      Técnico
                    </option>

                    <option value="consulta">
                      Consulta
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Empleado
                    vinculado
                    {formulario.rol ===
                      "tecnico" &&
                      " *"}
                  </label>

                  <SearchableSelect
                    endpoint="/empleados"
                    selectedOption={
                      empleadoFormulario
                    }
                    onChange={
                      seleccionarEmpleadoFormulario
                    }
                    placeholder="Buscar empleado..."
                    getOptionValue={(
                      empleado
                    ) =>
                      empleado._id
                    }
                    getOptionLabel={(
                      empleado
                    ) =>
                      `${empleado.codigoEmpleado} - ${empleado.nombres} ${empleado.apellidos}`
                    }
                  />

                  {formulario.rol ===
                    "tecnico" && (
                    <small className="form-help">
                      El usuario técnico
                      debe tener un
                      empleado vinculado
                      para recibir
                      mantenimientos.
                    </small>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  {usuarioEditando
                    ? "Nueva contraseña"
                    : "Contraseña"}
                </label>

                <div className="password-container">
                  <input
                    name="password"
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formulario.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      usuarioEditando
                        ? "Dejar vacío para conservar la contraseña"
                        : "Mínimo 6 caracteres"
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setMostrarPassword(
                        (
                          actual
                        ) =>
                          !actual
                      )
                    }
                  >
                    {mostrarPassword ? (
                      <EyeOff
                        size={19}
                      />
                    ) : (
                      <Eye
                        size={19}
                      />
                    )}
                  </button>
                </div>

                {usuarioEditando && (
                  <small className="form-help">
                    Si no desea cambiar
                    la contraseña, deje
                    este campo vacío.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  Estado
                </label>

                <label className="checkbox-field">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={
                      formulario.activo
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span>
                    Usuario activo
                  </span>
                </label>
              </div>

              <div className="roles-info-box">
                <div>
                  <strong>
                    Administrador
                  </strong>

                  <span>
                    Acceso completo al
                    sistema y gestión
                    de usuarios.
                  </span>
                </div>

                <div>
                  <strong>
                    Inventario
                  </strong>

                  <span>
                    Gestiona recursos,
                    grupos,
                    proveedores y
                    ajustes de
                    inventario.
                  </span>
                </div>

                <div>
                  <strong>
                    Técnico
                  </strong>

                  <span>
                    Gestiona
                    mantenimientos
                    asignados y sus
                    recursos
                    relacionados.
                  </span>
                </div>

                <div>
                  <strong>
                    Consulta
                  </strong>

                  <span>
                    Acceso de solo
                    lectura a los
                    módulos
                    permitidos.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarFormulario
                  }
                  disabled={
                    guardando
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="button-primary"
                  disabled={
                    guardando
                  }
                >
                  {guardando
                    ? "Guardando..."
                    : usuarioEditando
                      ? "Guardar cambios"
                      : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default UsuariosPage;