import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  BadgeX,
  Box,
  Boxes,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import SearchableSelect from "../../components/common/SearchableSelect.jsx";

const estadoInicialFormulario = {
  nombres: "",
  apellidos: "",
  codigoEmpleado: "",
  correo: "",
  telefono: "",
  cargo: "",
  areaId: "",
  activo: true,
};

const filtrosIniciales = {
  nombres: "",
  apellidos: "",
  codigoEmpleado: "",
  correo: "",
  cargo: "",
  activo: "",
};

const estadoInicialAsignacion = {
  recursoId: "",
  cantidad: 1,
};

const EmpleadosPage = () => {
  const { usuario } =
    useAuth();

  const puedeGestionar =
    usuario?.rol ===
    "administrador";

  const [
    empleados,
    setEmpleados,
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
    asignando,
    setAsignando,
  ] = useState(false);

  const [
    devolviendo,
    setDevolviendo,
  ] = useState(false);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    mostrarAsignacion,
    setMostrarAsignacion,
  ] = useState(false);

  const [
    mostrarDetalleAsignaciones,
    setMostrarDetalleAsignaciones,
  ] = useState(false);

  const [
    empleadoEditando,
    setEmpleadoEditando,
  ] = useState(null);

  const [
    empleadoAsignando,
    setEmpleadoAsignando,
  ] = useState(null);

  const [
    empleadoVisualizando,
    setEmpleadoVisualizando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    areaFormulario,
    setAreaFormulario,
  ] = useState(null);

  const [
    formularioAsignacion,
    setFormularioAsignacion,
  ] = useState(
    estadoInicialAsignacion
  );

  const [
    recursoAsignacion,
    setRecursoAsignacion,
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
    areaFiltro,
    setAreaFiltro,
  ] = useState(null);

  const [
    areaFiltroAplicado,
    setAreaFiltroAplicado,
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

  const obtenerData = (
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

  const obtenerEmpleados =
    async () => {
      try {
        setCargando(true);

        const params = {
          page: paginaActual,
          limit:
            registrosPorPagina,
        };

        if (
          filtrosAplicados.nombres
            .trim()
        ) {
          params.nombres =
            filtrosAplicados.nombres.trim();
        }

        if (
          filtrosAplicados.apellidos
            .trim()
        ) {
          params.apellidos =
            filtrosAplicados.apellidos.trim();
        }

        if (
          filtrosAplicados.codigoEmpleado
            .trim()
        ) {
          params.codigoEmpleado =
            filtrosAplicados.codigoEmpleado.trim();
        }

        if (
          filtrosAplicados.correo
            .trim()
        ) {
          params.correo =
            filtrosAplicados.correo.trim();
        }

        if (
          filtrosAplicados.cargo
            .trim()
        ) {
          params.cargo =
            filtrosAplicados.cargo.trim();
        }

        if (
          filtrosAplicados.activo !==
          ""
        ) {
          params.activo =
            filtrosAplicados.activo;
        }

        if (
          areaFiltroAplicado?._id
        ) {
          params.areaId =
            areaFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/empleados",
            {
              params,
            }
          );

        const data =
          obtenerData(response);

        setEmpleados(data);

        setTotalRegistros(
          response.data?.pagination
            ?.total ??
            data.length
        );

        const totalPages =
          response.data?.pagination
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
            "No se pudieron obtener los empleados"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerEmpleados();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    areaFiltroAplicado,
  ]);

  const handleFiltroChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const aplicarFiltros = (
    event
  ) => {
    event.preventDefault();

    setPaginaActual(1);

    setFiltrosAplicados({
      ...filtros,
    });

    setAreaFiltroAplicado(
      areaFiltro
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

      setAreaFiltro(null);

      setAreaFiltroAplicado(
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

  const seleccionarAreaFormulario =
    (area) => {
      setAreaFormulario(
        area || null
      );

      setFormulario(
        (prev) => ({
          ...prev,
          areaId:
            area?._id || "",
        })
      );
    };

  const seleccionarRecurso =
    (recurso) => {
      setRecursoAsignacion(
        recurso || null
      );

      setFormularioAsignacion(
        (prev) => ({
          ...prev,
          recursoId:
            recurso?._id || "",
        })
      );
    };

  const abrirCrear = () => {
    setEmpleadoEditando(
      null
    );

    setAreaFormulario(
      null
    );

    setFormulario(
      estadoInicialFormulario
    );

    setMostrarFormulario(
      true
    );
  };

  const abrirEditar = (
    empleado
  ) => {
    setEmpleadoEditando(
      empleado
    );

    const area =
      empleado.areaId &&
      typeof empleado.areaId ===
        "object"
        ? empleado.areaId
        : null;

    setAreaFormulario(area);

    setFormulario({
      nombres:
        empleado.nombres || "",
      apellidos:
        empleado.apellidos ||
        "",
      codigoEmpleado:
        empleado.codigoEmpleado ||
        "",
      correo:
        empleado.correo || "",
      telefono:
        empleado.telefono ||
        "",
      cargo:
        empleado.cargo || "",
      areaId:
        area?._id ||
        empleado.areaId ||
        "",
      activo:
        empleado.activo !==
        false,
    });

    setMostrarFormulario(
      true
    );
  };

  const cerrarFormulario =
    () => {
      setMostrarFormulario(
        false
      );

      setEmpleadoEditando(
        null
      );

      setAreaFormulario(
        null
      );

      setFormulario(
        estadoInicialFormulario
      );
    };

  const abrirAsignacion = (
    empleado
  ) => {
    setEmpleadoAsignando(
      empleado
    );

    setRecursoAsignacion(
      null
    );

    setFormularioAsignacion(
      estadoInicialAsignacion
    );

    setMostrarAsignacion(
      true
    );
  };

  const cerrarAsignacion =
    () => {
      setMostrarAsignacion(
        false
      );

      setEmpleadoAsignando(
        null
      );

      setRecursoAsignacion(
        null
      );

      setFormularioAsignacion(
        estadoInicialAsignacion
      );
    };

  const abrirDetalleAsignaciones =
    (empleado) => {
      setEmpleadoVisualizando(
        empleado
      );

      setMostrarDetalleAsignaciones(
        true
      );
    };

  const cerrarDetalleAsignaciones =
    () => {
      setEmpleadoVisualizando(
        null
      );

      setMostrarDetalleAsignaciones(
        false
      );
    };

  const validarFormulario =
    () => {
      if (
        !formulario.nombres.trim()
      ) {
        toast.error(
          "Los nombres son obligatorios"
        );

        return false;
      }

      if (
        !formulario.apellidos.trim()
      ) {
        toast.error(
          "Los apellidos son obligatorios"
        );

        return false;
      }

      if (
        !formulario.codigoEmpleado.trim()
      ) {
        toast.error(
          "El código de empleado es obligatorio"
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
        !formulario.cargo.trim()
      ) {
        toast.error(
          "El cargo es obligatorio"
        );

        return false;
      }

      if (!formulario.areaId) {
        toast.error(
          "Debe seleccionar un área"
        );

        return false;
      }

      return true;
    };

  const calcularDisponible = (
    recurso
  ) => {
    if (!recurso) {
      return 0;
    }

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

    return Math.max(
      0,
      total -
        prestados -
        reparacion -
        desecho
    );
  };

  const validarAsignacion =
    () => {
      if (
        !formularioAsignacion.recursoId
      ) {
        toast.error(
          "Debe seleccionar un recurso"
        );

        return false;
      }

      const cantidad =
        Number(
          formularioAsignacion.cantidad
        );

      if (
        !Number.isInteger(
          cantidad
        ) ||
        cantidad <= 0
      ) {
        toast.error(
          "La cantidad debe ser un número entero mayor que cero"
        );

        return false;
      }

      const disponible =
        calcularDisponible(
          recursoAsignacion
        );

      if (
        cantidad >
        disponible
      ) {
        toast.error(
          `Solo hay ${disponible} unidad(es) disponibles`
        );

        return false;
      }

      return true;
    };

  const guardarEmpleado =
    async (event) => {
      event.preventDefault();

      if (!puedeGestionar) {
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
          nombres:
            formulario.nombres.trim(),
          apellidos:
            formulario.apellidos.trim(),
          codigoEmpleado:
            formulario.codigoEmpleado.trim(),
          correo:
            formulario.correo
              .trim()
              .toLowerCase(),
          telefono:
            formulario.telefono.trim(),
          cargo:
            formulario.cargo.trim(),
          areaId:
            formulario.areaId,
          activo:
            formulario.activo,
        };

        if (
          empleadoEditando
        ) {
          await api.put(
            `/empleados/${empleadoEditando._id}`,
            payload
          );

          toast.success(
            "Empleado actualizado correctamente"
          );
        } else {
          await api.post(
            "/empleados",
            payload
          );

          toast.success(
            "Empleado creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerEmpleados();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el empleado"
        );
      } finally {
        setGuardando(false);
      }
    };

  const guardarAsignacion =
    async (event) => {
      event.preventDefault();

      if (
        !empleadoAsignando ||
        !puedeGestionar
      ) {
        return;
      }

      if (
        !validarAsignacion()
      ) {
        return;
      }

      try {
        setAsignando(true);

        await api.post(
          `/empleados/${empleadoAsignando._id}/asignaciones`,
          {
            recursoId:
              formularioAsignacion.recursoId,
            cantidad:
              Number(
                formularioAsignacion.cantidad
              ),
          }
        );

        toast.success(
          "Recurso asignado correctamente"
        );

        cerrarAsignacion();

        await obtenerEmpleados();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo asignar el recurso"
        );
      } finally {
        setAsignando(false);
      }
    };

  const devolverAsignacion =
    async (
      empleado,
      asignacion
    ) => {
      if (!puedeGestionar) {
        return;
      }

      const recurso =
        asignacion
          ?.recursoId;

      const nombre =
        typeof recurso ===
        "object"
          ? recurso.nombre
          : "el recurso";

      const confirmar =
        window.confirm(
          `¿Confirmar devolución de "${nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        setDevolviendo(true);

        const response =
          await api.delete(
            `/empleados/${empleado._id}/asignaciones/${asignacion._id}`
          );

        const actualizado =
          response.data?.data;

        toast.success(
          "Recurso devuelto correctamente"
        );

        if (actualizado) {
          setEmpleadoVisualizando(
            actualizado
          );
        }

        await obtenerEmpleados();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo devolver el recurso"
        );
      } finally {
        setDevolviendo(false);
      }
    };

  const eliminarEmpleado =
    async (empleado) => {
      if (!puedeGestionar) {
        return;
      }

      const nombreCompleto =
        `${empleado.nombres} ${empleado.apellidos}`;

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar al empleado "${nombreCompleto}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/empleados/${empleado._id}`
        );

        toast.success(
          "Empleado eliminado correctamente"
        );

        await obtenerEmpleados();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el empleado"
        );
      }
    };

  const obtenerNombreArea = (
    empleado
  ) => {
    if (
      empleado.areaId &&
      typeof empleado.areaId ===
        "object"
    ) {
      return (
        empleado.areaId
          .nombre ||
        "Sin área"
      );
    }

    return "—";
  };

  const obtenerCantidadAsignaciones =
    (empleado) => {
      return Array.isArray(
        empleado.asignaciones
      )
        ? empleado
            .asignaciones
            .length
        : 0;
    };

  const obtenerRecursoAsignacion =
    (asignacion) => {
      if (
        asignacion
          ?.recursoId &&
        typeof asignacion
          .recursoId ===
          "object"
      ) {
        return asignacion
          .recursoId;
      }

      return null;
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

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <UserRound
            size={30}
          />

          <div>
            <h1>
              Empleados
            </h1>

            <p>
              Gestión de personal y
              custodia de recursos
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerEmpleados
            }
          >
            <RefreshCw
              size={18}
            />
            Actualizar
          </button>

          {puedeGestionar && (
            <button
              type="button"
              className="button-primary"
              onClick={
                abrirCrear
              }
            >
              <Plus size={18} />
              Nuevo empleado
            </button>
          )}
        </div>
      </div>

      {!puedeGestionar && (
        <div className="permission-info">
          Su rol tiene acceso de
          solo lectura en este
          módulo.
        </div>
      )}

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
                Nombres
              </label>

              <input
                name="nombres"
                value={
                  filtros.nombres
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar nombres"
              />
            </div>

            <div className="form-group">
              <label>
                Apellidos
              </label>

              <input
                name="apellidos"
                value={
                  filtros.apellidos
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar apellidos"
              />
            </div>

            <div className="form-group">
              <label>
                Código
              </label>

              <input
                name="codigoEmpleado"
                value={
                  filtros.codigoEmpleado
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="EMP-001"
              />
            </div>

            <div className="form-group">
              <label>
                Correo
              </label>

              <input
                name="correo"
                value={
                  filtros.correo
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Correo"
              />
            </div>

            <div className="form-group">
              <label>
                Cargo
              </label>

              <input
                name="cargo"
                value={
                  filtros.cargo
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Cargo"
              />
            </div>

            <div className="form-group">
              <label>
                Área
              </label>

              <SearchableSelect
                endpoint="/areas"
                selectedOption={
                  areaFiltro
                }
                onChange={
                  setAreaFiltro
                }
                placeholder="Buscar área..."
                getOptionValue={(
                  area
                ) => area._id}
                getOptionLabel={(
                  area
                ) =>
                  area.nombre
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
            Cargando empleados...
          </div>
        ) : empleados.length ===
          0 ? (
          <div className="table-message">
            No hay empleados para
            mostrar.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      Empleado
                    </th>
                    <th>
                      Código
                    </th>
                    <th>
                      Correo
                    </th>
                    <th>
                      Teléfono
                    </th>
                    <th>
                      Cargo
                    </th>
                    <th>
                      Área
                    </th>
                    <th>
                      Asignaciones
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
                  {empleados.map(
                    (empleado) => (
                      <tr
                        key={
                          empleado._id
                        }
                      >
                        <td>
                          <div className="employee-name">
                            <div className="employee-avatar">
                              {empleado.nombres
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}

                              {empleado.apellidos
                                ?.charAt(
                                  0
                                )
                                ?.toUpperCase()}
                            </div>

                            <strong>
                              {
                                empleado.nombres
                              }{" "}
                              {
                                empleado.apellidos
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">
                            {
                              empleado.codigoEmpleado
                            }
                          </span>
                        </td>

                        <td>
                          {
                            empleado.correo
                          }
                        </td>

                        <td>
                          {empleado.telefono ||
                            "—"}
                        </td>

                        <td>
                          {
                            empleado.cargo
                          }
                        </td>

                        <td>
                          {obtenerNombreArea(
                            empleado
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="assignment-count-button"
                            onClick={() =>
                              abrirDetalleAsignaciones(
                                empleado
                              )
                            }
                          >
                            <Boxes
                              size={
                                15
                              }
                            />

                            {obtenerCantidadAsignaciones(
                              empleado
                            )}
                          </button>
                        </td>

                        <td>
                          {empleado.activo !==
                          false ? (
                            <span className="status-badge active">
                              <BadgeCheck
                                size={
                                  15
                                }
                              />
                              Activo
                            </span>
                          ) : (
                            <span className="status-badge inactive">
                              <BadgeX
                                size={
                                  15
                                }
                              />
                              Inactivo
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="icon-button"
                              title="Ver asignaciones"
                              onClick={() =>
                                abrirDetalleAsignaciones(
                                  empleado
                                )
                              }
                            >
                              <Eye
                                size={
                                  17
                                }
                              />
                            </button>

                            {puedeGestionar && (
                              <>
                                <button
                                  type="button"
                                  className="icon-button assignment-action"
                                  title="Asignar recurso"
                                  onClick={() =>
                                    abrirAsignacion(
                                      empleado
                                    )
                                  }
                                >
                                  <Box
                                    size={
                                      17
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="icon-button"
                                  title="Editar"
                                  onClick={() =>
                                    abrirEditar(
                                      empleado
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
                                  className="icon-button danger"
                                  title="Eliminar"
                                  onClick={() =>
                                    eliminarEmpleado(
                                      empleado
                                    )
                                  }
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                </button>
                              </>
                            )}
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

                setPaginaActual(1);
              }}
            />
          </>
        )}
      </div>

      {mostrarFormulario &&
        puedeGestionar && (
          <div className="modal-overlay">
            <div className="modal-card modal-large">
              <div className="modal-header">
                <div>
                  <h2>
                    {empleadoEditando
                      ? "Editar empleado"
                      : "Nuevo empleado"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={
                    cerrarFormulario
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="entity-form"
                onSubmit={
                  guardarEmpleado
                }
              >
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Nombres
                      </label>

                      <input
                        name="nombres"
                        value={
                          formulario.nombres
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Apellidos
                      </label>

                      <input
                        name="apellidos"
                        value={
                          formulario.apellidos
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Código
                      </label>

                      <input
                        name="codigoEmpleado"
                        value={
                          formulario.codigoEmpleado
                        }
                        onChange={
                          handleChange
                        }
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
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Teléfono
                      </label>

                      <input
                        name="telefono"
                        value={
                          formulario.telefono
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Cargo
                      </label>

                      <input
                        name="cargo"
                        value={
                          formulario.cargo
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Área
                      </label>

                      <SearchableSelect
                        endpoint="/areas"
                        selectedOption={
                          areaFormulario
                        }
                        onChange={
                          seleccionarAreaFormulario
                        }
                        placeholder="Buscar área..."
                        getOptionValue={(
                          area
                        ) =>
                          area._id
                        }
                        getOptionLabel={(
                          area
                        ) =>
                          area.nombre
                        }
                      />
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
                          Empleado activo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
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
                      : empleadoEditando
                        ? "Actualizar"
                        : "Crear empleado"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {mostrarAsignacion &&
        puedeGestionar &&
        empleadoAsignando && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h2>
                    Asignar recurso
                  </h2>

                  <p>
                    {
                      empleadoAsignando.nombres
                    }{" "}
                    {
                      empleadoAsignando.apellidos
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={
                    cerrarAsignacion
                  }
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="entity-form"
                onSubmit={
                  guardarAsignacion
                }
              >
                <div className="form-group">
                  <label>
                    Recurso
                  </label>

                  <SearchableSelect
                    endpoint="/recursos"
                    selectedOption={
                      recursoAsignacion
                    }
                    onChange={
                      seleccionarRecurso
                    }
                    placeholder="Buscar por nombre o código..."
                    getOptionValue={(
                      recurso
                    ) =>
                      recurso._id
                    }
                    getOptionLabel={(
                      recurso
                    ) =>
                      `${recurso.codigo} - ${recurso.nombre}`
                    }
                  />
                </div>

                {recursoAsignacion && (
                  <div className="permission-info">
                    Disponible:{" "}
                    <strong>
                      {calcularDisponible(
                        recursoAsignacion
                      )}
                    </strong>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    Cantidad
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      formularioAsignacion.cantidad
                    }
                    onChange={(
                      event
                    ) =>
                      setFormularioAsignacion(
                        (
                          prev
                        ) => ({
                          ...prev,
                          cantidad:
                            event
                              .target
                              .value ===
                            ""
                              ? ""
                              : Number(
                                  event
                                    .target
                                    .value
                                ),
                        })
                      )
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={
                      cerrarAsignacion
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="button-primary"
                    disabled={
                      asignando
                    }
                  >
                    {asignando
                      ? "Asignando..."
                      : "Asignar recurso"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {mostrarDetalleAsignaciones &&
        empleadoVisualizando && (
          <div className="modal-overlay">
            <div className="modal-card modal-large">
              <div className="modal-header">
                <div>
                  <h2>
                    Recursos asignados
                  </h2>

                  <p>
                    {
                      empleadoVisualizando.nombres
                    }{" "}
                    {
                      empleadoVisualizando.apellidos
                    }
                  </p>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={
                    cerrarDetalleAsignaciones
                  }
                >
                  <X size={20} />
                </button>
              </div>

              {!Array.isArray(
                empleadoVisualizando.asignaciones
              ) ||
              empleadoVisualizando
                .asignaciones
                .length === 0 ? (
                <div className="table-message">
                  Este empleado no
                  tiene recursos
                  asignados.
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>
                          Recurso
                        </th>
                        <th>
                          Código
                        </th>
                        <th>
                          Cantidad
                        </th>
                        <th>
                          Fecha
                        </th>

                        {puedeGestionar && (
                          <th>
                            Acción
                          </th>
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {empleadoVisualizando.asignaciones.map(
                        (
                          asignacion
                        ) => {
                          const recurso =
                            obtenerRecursoAsignacion(
                              asignacion
                            );

                          return (
                            <tr
                              key={
                                asignacion._id
                              }
                            >
                              <td>
                                {recurso?.nombre ||
                                  "Recurso no disponible"}
                              </td>

                              <td>
                                <span className="code-badge">
                                  {recurso?.codigo ||
                                    "—"}
                                </span>
                              </td>

                              <td>
                                {
                                  asignacion.cantidad
                                }
                              </td>

                              <td>
                                {formatearFecha(
                                  asignacion.fechaAsignacion
                                )}
                              </td>

                              {puedeGestionar && (
                                <td>
                                  <button
                                    type="button"
                                    className="button-secondary"
                                    disabled={
                                      devolviendo
                                    }
                                    onClick={() =>
                                      devolverAsignacion(
                                        empleadoVisualizando,
                                        asignacion
                                      )
                                    }
                                  >
                                    <RotateCcw
                                      size={
                                        16
                                      }
                                    />
                                    Devolver
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={
                    cerrarDetalleAsignaciones
                  }
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
};

export default EmpleadosPage;