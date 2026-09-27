import {
  useEffect,
  useState,
} from "react";

import {
  Filter,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import SearchableSelect from "../../components/common/SearchableSelect.jsx";

const estadoInicialFormulario = {
  nombre: "",
  descripcion: "",
  ubicacion: "",
  departamentoId: "",
};

const filtrosIniciales = {
  nombre: "",
  descripcion: "",
  ubicacion: "",
};

const AreasPage = () => {
  const {
    usuario,
  } = useAuth();

  const puedeGestionar =
    usuario?.rol ===
    "administrador";

  const [
    areas,
    setAreas,
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
    areaEditando,
    setAreaEditando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    departamentoFormulario,
    setDepartamentoFormulario,
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
    departamentoFiltro,
    setDepartamentoFiltro,
  ] = useState(null);

  const [
    departamentoFiltroAplicado,
    setDepartamentoFiltroAplicado,
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

  const obtenerAreas =
    async () => {
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
          filtrosAplicados.descripcion
            .trim()
        ) {
          params.descripcion =
            filtrosAplicados.descripcion.trim();
        }

        if (
          filtrosAplicados.ubicacion
            .trim()
        ) {
          params.ubicacion =
            filtrosAplicados.ubicacion.trim();
        }

        if (
          departamentoFiltroAplicado?._id
        ) {
          params.departamentoId =
            departamentoFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/areas",
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

        setAreas(
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
            "No se pudieron obtener las áreas"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerAreas();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    departamentoFiltroAplicado,
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

      setDepartamentoFiltroAplicado(
        departamentoFiltro
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

      setDepartamentoFiltro(
        null
      );

      setDepartamentoFiltroAplicado(
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
    } = event.target;

    setFormulario(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const seleccionarDepartamentoFormulario =
    (departamento) => {
      setDepartamentoFormulario(
        departamento || null
      );

      setFormulario(
        (prev) => ({
          ...prev,
          departamentoId:
            departamento?._id ||
            "",
        })
      );
    };

  const abrirCrear = () => {
    setAreaEditando(null);

    setDepartamentoFormulario(
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
    area
  ) => {
    setAreaEditando(area);

    const departamento =
      area.departamentoId &&
      typeof area.departamentoId ===
        "object"
        ? area.departamentoId
        : null;

    setDepartamentoFormulario(
      departamento
    );

    setFormulario({
      nombre:
        area.nombre ||
        "",
      descripcion:
        area.descripcion ||
        "",
      ubicacion:
        area.ubicacion ||
        "",
      departamentoId:
        departamento?._id ||
        area.departamentoId ||
        "",
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

      setAreaEditando(null);

      setDepartamentoFormulario(
        null
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
          "El nombre del área es obligatorio"
        );

        return false;
      }

      if (
        !formulario.ubicacion.trim()
      ) {
        toast.error(
          "La ubicación es obligatoria"
        );

        return false;
      }

      if (
        !formulario
          .departamentoId
      ) {
        toast.error(
          "Debe seleccionar un departamento"
        );

        return false;
      }

      return true;
    };

  const guardarArea =
    async (event) => {
      event.preventDefault();

      if (!puedeGestionar) {
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
          descripcion:
            formulario.descripcion.trim(),
          ubicacion:
            formulario.ubicacion.trim(),
          departamentoId:
            formulario.departamentoId,
        };

        if (areaEditando) {
          await api.put(
            `/areas/${areaEditando._id}`,
            payload
          );

          toast.success(
            "Área actualizada correctamente"
          );
        } else {
          await api.post(
            "/areas",
            payload
          );

          toast.success(
            "Área creada correctamente"
          );
        }

        cerrarFormulario();

        await obtenerAreas();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el área"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarArea =
    async (area) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar el área "${area.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/areas/${area._id}`
        );

        toast.success(
          "Área eliminada correctamente"
        );

        await obtenerAreas();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el área"
        );
      }
    };

  const obtenerNombreDepartamento =
    (area) => {
      if (
        area.departamentoId &&
        typeof area.departamentoId ===
          "object"
      ) {
        return (
          area
            .departamentoId
            .nombre ||
          "Sin departamento"
        );
      }

      return "Sin departamento";
    };

  const obtenerNombreEmpresa =
    (area) => {
      if (
        area.departamentoId &&
        typeof area.departamentoId ===
          "object" &&
        area.departamentoId
          .empresaId
      ) {
        if (
          typeof area
            .departamentoId
            .empresaId ===
          "object"
        ) {
          return (
            area
              .departamentoId
              .empresaId
              .nombre ||
            "—"
          );
        }
      }

      return "—";
    };

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <MapPin
            size={30}
          />

          <div>
            <h1>
              Áreas
            </h1>

            <p>
              Gestión de áreas
              asociadas a los
              departamentos
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerAreas
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
              <Plus
                size={18}
              />
              Nueva área
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
                placeholder="Buscar por nombre"
              />
            </div>

            <div className="form-group">
              <label>
                Descripción
              </label>

              <input
                name="descripcion"
                type="text"
                value={
                  filtros.descripcion
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar descripción"
              />
            </div>

            <div className="form-group">
              <label>
                Ubicación
              </label>

              <input
                name="ubicacion"
                type="text"
                value={
                  filtros.ubicacion
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Ej. segundo nivel"
              />
            </div>

            <div className="form-group">
              <label>
                Departamento
              </label>

              <SearchableSelect
                endpoint="/departamentos"
                selectedOption={
                  departamentoFiltro
                }
                onChange={
                  setDepartamentoFiltro
                }
                placeholder="Buscar departamento..."
                getOptionValue={(
                  departamento
                ) =>
                  departamento._id
                }
                getOptionLabel={(
                  departamento
                ) =>
                  departamento.nombre
                }
              />
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
            Cargando áreas...
          </div>
        ) : areas.length ===
          0 ? (
          <div className="table-message">
            No hay áreas que
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
                      Nombre
                    </th>

                    <th>
                      Descripción
                    </th>

                    <th>
                      Ubicación
                    </th>

                    <th>
                      Departamento
                    </th>

                    <th>
                      Empresa
                    </th>

                    {puedeGestionar && (
                      <th>
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {areas.map(
                    (area) => (
                      <tr
                        key={
                          area._id
                        }
                      >
                        <td>
                          <div className="resource-name">
                            <div className="resource-icon">
                              <MapPin
                                size={
                                  18
                                }
                              />
                            </div>

                            <strong>
                              {
                                area.nombre
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          {area.descripcion ||
                            "—"}
                        </td>

                        <td>
                          {area.ubicacion ||
                            "—"}
                        </td>

                        <td>
                          {obtenerNombreDepartamento(
                            area
                          )}
                        </td>

                        <td>
                          {obtenerNombreEmpresa(
                            area
                          )}
                        </td>

                        {puedeGestionar && (
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="icon-button"
                                title="Editar"
                                onClick={() =>
                                  abrirEditar(
                                    area
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
                                  eliminarArea(
                                    area
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
                        )}
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

      {mostrarFormulario &&
        puedeGestionar && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <div>
                  <h2>
                    {areaEditando
                      ? "Editar área"
                      : "Nueva área"}
                  </h2>

                  <p>
                    {areaEditando
                      ? "Modifique los datos del área."
                      : "Complete los datos para registrar un área."}
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
                  guardarArea
                }
              >
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
                    placeholder="Nombre del área"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Descripción
                  </label>

                  <textarea
                    name="descripcion"
                    rows={4}
                    value={
                      formulario.descripcion
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Descripción del área"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Ubicación
                  </label>

                  <input
                    name="ubicacion"
                    type="text"
                    value={
                      formulario.ubicacion
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Ej. Segundo nivel"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Departamento
                  </label>

                  <SearchableSelect
                    endpoint="/departamentos"
                    selectedOption={
                      departamentoFormulario
                    }
                    onChange={
                      seleccionarDepartamentoFormulario
                    }
                    placeholder="Buscar departamento..."
                    getOptionValue={(
                      departamento
                    ) =>
                      departamento._id
                    }
                    getOptionLabel={(
                      departamento
                    ) =>
                      departamento.nombre
                    }
                  />
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
                      : areaEditando
                        ? "Guardar cambios"
                        : "Crear área"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default AreasPage;