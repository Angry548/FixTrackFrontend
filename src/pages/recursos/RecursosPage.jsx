import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Box,
  Boxes,
  Filter,
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
  codigo: "",
  descripcion: "",
  areaId: "",
  categoriaRecursoId: "",
  existenciaTotal: 0,
  activo: true,
  metadatos: {},
};

const filtrosIniciales = {
  nombre: "",
  codigo: "",
  descripcion: "",
  activo: "",
};

const RecursosPage = ({
  modo = "general",
}) => {
  const {
    usuario,
    empleadoId,
  } = useAuth();

  const esRelacionados =
    modo === "relacionados";

  const puedeGestionar =
    !esRelacionados &&
    [
      "administrador",
      "inventario",
    ].includes(usuario?.rol);

  const [recursos, setRecursos] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    recursoEditando,
    setRecursoEditando,
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
    categoriaFormulario,
    setCategoriaFormulario,
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
    categoriaFiltro,
    setCategoriaFiltro,
  ] = useState(null);

  const [
    areaFiltroAplicado,
    setAreaFiltroAplicado,
  ] = useState(null);

  const [
    categoriaFiltroAplicado,
    setCategoriaFiltroAplicado,
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

  const obtenerRecursosRelacionados =
    async () => {
      if (!empleadoId) {
        setRecursos([]);
        setTotalRegistros(0);

        return;
      }

      const response =
        await api.get(
          "/mantenimientos",
          {
            params: {
              tecnicoAsignadoId:
                empleadoId,
            },
          }
        );

      const mantenimientos =
        obtenerData(response);

      const mapa = new Map();

      mantenimientos.forEach(
        (mantenimiento) => {
          const recurso =
            mantenimiento.recursoId;

          if (
            recurso &&
            typeof recurso ===
              "object" &&
            recurso._id
          ) {
            mapa.set(
              recurso._id,
              recurso
            );
          }
        }
      );

      let registros = [
        ...mapa.values(),
      ];

      if (
        filtrosAplicados.nombre
          .trim()
      ) {
        const texto =
          filtrosAplicados.nombre
            .trim()
            .toLowerCase();

        registros =
          registros.filter(
            (recurso) =>
              recurso.nombre
                ?.toLowerCase()
                .includes(texto)
          );
      }

      if (
        filtrosAplicados.codigo
          .trim()
      ) {
        const texto =
          filtrosAplicados.codigo
            .trim()
            .toLowerCase();

        registros =
          registros.filter(
            (recurso) =>
              recurso.codigo
                ?.toLowerCase()
                .includes(texto)
          );
      }

      if (
        filtrosAplicados.activo !==
        ""
      ) {
        const activo =
          filtrosAplicados.activo ===
          "true";

        registros =
          registros.filter(
            (recurso) =>
              recurso.activo !==
                false ===
              activo
          );
      }

      setTotalRegistros(
        registros.length
      );

      const inicio =
        (paginaActual - 1) *
        registrosPorPagina;

      setRecursos(
        registros.slice(
          inicio,
          inicio +
            registrosPorPagina
        )
      );
    };

  const obtenerRecursos =
    async () => {
      try {
        setCargando(true);

        if (esRelacionados) {
          await obtenerRecursosRelacionados();

          return;
        }

        const params = {
          page: paginaActual,
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
          filtrosAplicados.codigo
            .trim()
        ) {
          params.codigo =
            filtrosAplicados.codigo.trim();
        }

        if (
          filtrosAplicados.descripcion
            .trim()
        ) {
          params.descripcion =
            filtrosAplicados.descripcion.trim();
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

        if (
          categoriaFiltroAplicado?._id
        ) {
          params.categoriaRecursoId =
            categoriaFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/recursos",
            {
              params,
            }
          );

        const data =
          obtenerData(response);

        setRecursos(data);

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
            "No se pudieron obtener los recursos"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerRecursos();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    areaFiltroAplicado,
    categoriaFiltroAplicado,
    esRelacionados,
    empleadoId,
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

    setCategoriaFiltroAplicado(
      categoriaFiltro
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
      setCategoriaFiltro(null);

      setAreaFiltroAplicado(
        null
      );

      setCategoriaFiltroAplicado(
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
      type === "checkbox"
    ) {
      setFormulario(
        (prev) => ({
          ...prev,
          [name]: checked,
        })
      );

      return;
    }

    if (
      name ===
      "existenciaTotal"
    ) {
      setFormulario(
        (prev) => ({
          ...prev,
          existenciaTotal:
            value === ""
              ? ""
              : Number(value),
        })
      );

      return;
    }

    setFormulario(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const handleMetadataChange = (
    campo,
    valor
  ) => {
    setFormulario(
      (prev) => ({
        ...prev,
        metadatos: {
          ...prev.metadatos,
          [campo]: valor,
        },
      })
    );
  };

  const camposObligatorios =
    useMemo(() => {
      return Array.isArray(
        categoriaFormulario
          ?.camposObligatorios
      )
        ? categoriaFormulario
            .camposObligatorios
        : [];
    }, [
      categoriaFormulario,
    ]);

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

  const seleccionarCategoriaFormulario =
    (categoria) => {
      setCategoriaFormulario(
        categoria || null
      );

      const nuevosMetadatos =
        {};

      const campos =
        Array.isArray(
          categoria
            ?.camposObligatorios
        )
          ? categoria
              .camposObligatorios
          : [];

      campos.forEach(
        (campo) => {
          nuevosMetadatos[
            campo
          ] =
            formulario
              .metadatos?.[
                campo
              ] || "";
        }
      );

      setFormulario(
        (prev) => ({
          ...prev,
          categoriaRecursoId:
            categoria?._id ||
            "",
          metadatos:
            nuevosMetadatos,
        })
      );
    };

  const abrirCrear = () => {
    setRecursoEditando(null);

    setFormulario({
      ...estadoInicialFormulario,
      metadatos: {},
    });

    setAreaFormulario(null);

    setCategoriaFormulario(
      null
    );

    setMostrarFormulario(
      true
    );
  };

  const abrirEditar = (
    recurso
  ) => {
    setRecursoEditando(
      recurso
    );

    const area =
      recurso.areaId &&
      typeof recurso.areaId ===
        "object"
        ? recurso.areaId
        : null;

    const categoria =
      recurso.categoriaRecursoId &&
      typeof recurso.categoriaRecursoId ===
        "object"
        ? recurso.categoriaRecursoId
        : null;

    setAreaFormulario(area);

    setCategoriaFormulario(
      categoria
    );

    setFormulario({
      nombre:
        recurso.nombre || "",
      codigo:
        recurso.codigo || "",
      descripcion:
        recurso.descripcion ||
        "",
      areaId:
        area?._id ||
        recurso.areaId ||
        "",
      categoriaRecursoId:
        categoria?._id ||
        recurso.categoriaRecursoId ||
        "",
      existenciaTotal:
        recurso.existenciaTotal ??
        0,
      activo:
        recurso.activo !==
        false,
      metadatos:
        recurso.metadatos &&
        typeof recurso.metadatos ===
          "object"
          ? {
              ...recurso.metadatos,
            }
          : {},
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

      setRecursoEditando(
        null
      );

      setAreaFormulario(null);

      setCategoriaFormulario(
        null
      );

      setFormulario({
        ...estadoInicialFormulario,
        metadatos: {},
      });
    };

  const validarFormulario =
    () => {
      if (
        !formulario.nombre.trim()
      ) {
        toast.error(
          "El nombre del recurso es obligatorio"
        );

        return false;
      }

      if (
        !formulario.codigo.trim()
      ) {
        toast.error(
          "El código del recurso es obligatorio"
        );

        return false;
      }

      if (!formulario.areaId) {
        toast.error(
          "Debe seleccionar un área"
        );

        return false;
      }

      if (
        !formulario
          .categoriaRecursoId
      ) {
        toast.error(
          "Debe seleccionar una categoría"
        );

        return false;
      }

      const total =
        Number(
          formulario.existenciaTotal
        );

      if (
        !Number.isInteger(
          total
        ) ||
        total < 0
      ) {
        toast.error(
          "La existencia total debe ser un número entero igual o mayor que cero"
        );

        return false;
      }

      for (
        const campo of
        camposObligatorios
      ) {
        const valor =
          formulario
            .metadatos?.[
              campo
            ];

        if (
          valor === undefined ||
          valor === null ||
          String(
            valor
          ).trim() === ""
        ) {
          toast.error(
            `El campo "${campo}" es obligatorio`
          );

          return false;
        }
      }

      return true;
    };

  const guardarRecurso =
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
          codigo:
            formulario.codigo.trim(),
          descripcion:
            formulario.descripcion.trim(),
          areaId:
            formulario.areaId,
          categoriaRecursoId:
            formulario
              .categoriaRecursoId,
          existenciaTotal:
            Number(
              formulario.existenciaTotal
            ),
          metadatos:
            formulario.metadatos,
          activo:
            formulario.activo,
        };

        if (recursoEditando) {
          await api.put(
            `/recursos/${recursoEditando._id}`,
            payload
          );

          toast.success(
            "Recurso actualizado correctamente"
          );
        } else {
          await api.post(
            "/recursos",
            payload
          );

          toast.success(
            "Recurso creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerRecursos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el recurso"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarRecurso =
    async (recurso) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar el recurso "${recurso.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/recursos/${recurso._id}`
        );

        toast.success(
          "Recurso eliminado correctamente"
        );

        await obtenerRecursos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el recurso"
        );
      }
    };

  const obtenerNombreArea = (
    recurso
  ) => {
    if (
      recurso.areaId &&
      typeof recurso.areaId ===
        "object"
    ) {
      return (
        recurso.areaId
          .nombre ||
        "Sin área"
      );
    }

    return "—";
  };

  const obtenerNombreCategoria =
    (recurso) => {
      if (
        recurso
          .categoriaRecursoId &&
        typeof recurso
          .categoriaRecursoId ===
          "object"
      ) {
        return (
          recurso
            .categoriaRecursoId
            .nombre ||
          "Sin categoría"
        );
      }

      return "—";
    };

  const calcularDisponible = (
    recurso
  ) => {
    const total =
      Number(
        recurso.existenciaTotal
      ) || 0;

    const prestada =
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
        prestada -
        reparacion -
        desecho
    );
  };

  const titulo =
    esRelacionados
      ? "Recursos relacionados"
      : "Recursos";

  const descripcion =
    esRelacionados
      ? "Recursos vinculados a sus mantenimientos asignados"
      : "Gestión del inventario de recursos de FixTrack";

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <Box size={30} />

          <div>
            <h1>{titulo}</h1>

            <p>
              {descripcion}
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerRecursos
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
              Nuevo recurso
            </button>
          )}
        </div>
      </div>

      {!puedeGestionar && (
        <div className="permission-info">
          Este módulo se encuentra
          disponible en modo de
          consulta.
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
                Código
              </label>

              <input
                name="codigo"
                type="text"
                value={
                  filtros.codigo
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar por código"
              />
            </div>

            {!esRelacionados && (
              <>
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
                    Categoría
                  </label>

                  <SearchableSelect
                    endpoint="/categorias-recursos"
                    selectedOption={
                      categoriaFiltro
                    }
                    onChange={
                      setCategoriaFiltro
                    }
                    placeholder="Buscar categoría..."
                    getOptionValue={(
                      categoria
                    ) =>
                      categoria._id
                    }
                    getOptionLabel={(
                      categoria
                    ) =>
                      categoria.nombre
                    }
                  />
                </div>
              </>
            )}

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
            Cargando recursos...
          </div>
        ) : recursos.length ===
          0 ? (
          <div className="table-message">
            No hay recursos para
            mostrar.
          </div>
        ) : (
          <>
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

                    {!esRelacionados && (
                      <>
                        <th>
                          Categoría
                        </th>
                        <th>
                          Área
                        </th>
                      </>
                    )}

                    <th>
                      Total
                    </th>
                    <th>
                      Disponible
                    </th>
                    <th>
                      Prestado
                    </th>
                    <th>
                      Reparación
                    </th>
                    <th>
                      Desecho
                    </th>
                    <th>
                      Estado
                    </th>

                    {puedeGestionar && (
                      <th>
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {recursos.map(
                    (recurso) => (
                      <tr
                        key={
                          recurso._id
                        }
                      >
                        <td>
                          <div className="resource-name">
                            <div className="resource-icon">
                              <Boxes
                                size={
                                  18
                                }
                              />
                            </div>

                            <div>
                              <strong>
                                {
                                  recurso.nombre
                                }
                              </strong>

                              {recurso.descripcion && (
                                <span>
                                  {
                                    recurso.descripcion
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">
                            {
                              recurso.codigo
                            }
                          </span>
                        </td>

                        {!esRelacionados && (
                          <>
                            <td>
                              {obtenerNombreCategoria(
                                recurso
                              )}
                            </td>

                            <td>
                              {obtenerNombreArea(
                                recurso
                              )}
                            </td>
                          </>
                        )}

                        <td>
                          {
                            recurso.existenciaTotal
                          }
                        </td>

                        <td>
                          <span className="stock-badge available">
                            {calcularDisponible(
                              recurso
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="stock-badge loaned">
                            {recurso.cantidadPrestada ||
                              0}
                          </span>
                        </td>

                        <td>
                          <span className="stock-badge repair">
                            {recurso.cantidadEnReparacion ||
                              0}
                          </span>
                        </td>

                        <td>
                          <span className="stock-badge discarded">
                            {recurso.cantidadDesecho ||
                              0}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              recurso.activo !==
                              false
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            {recurso.activo !==
                            false
                              ? "Activo"
                              : "Inactivo"}
                          </span>
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
                                    recurso
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
                                  eliminarRecurso(
                                    recurso
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
                    {recursoEditando
                      ? "Editar recurso"
                      : "Nuevo recurso"}
                  </h2>

                  <p>
                    Complete la
                    información del
                    recurso.
                  </p>
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
                  guardarRecurso
                }
              >
                <div className="form-section">
                  <h3>
                    Información general
                  </h3>

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
                        placeholder="Ej. Laptop Dell"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Código
                      </label>

                      <input
                        name="codigo"
                        type="text"
                        value={
                          formulario.codigo
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="REC-001"
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
                        Categoría
                      </label>

                      <SearchableSelect
                        endpoint="/categorias-recursos"
                        selectedOption={
                          categoriaFormulario
                        }
                        onChange={
                          seleccionarCategoriaFormulario
                        }
                        placeholder="Buscar categoría..."
                        getOptionValue={(
                          categoria
                        ) =>
                          categoria._id
                        }
                        getOptionLabel={(
                          categoria
                        ) =>
                          categoria.nombre
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Existencia total
                      </label>

                      <input
                        name="existenciaTotal"
                        type="number"
                        min="0"
                        step="1"
                        value={
                          formulario.existenciaTotal
                        }
                        onChange={
                          handleChange
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
                          Recurso activo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Descripción
                    </label>

                    <textarea
                      name="descripcion"
                      rows={3}
                      value={
                        formulario.descripcion
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Descripción del recurso"
                    />
                  </div>
                </div>

                {camposObligatorios.length >
                  0 && (
                  <div className="form-section">
                    <h3>
                      Datos adicionales
                    </h3>

                    <div className="form-grid">
                      {camposObligatorios.map(
                        (campo) => (
                          <div
                            className="form-group"
                            key={
                              campo
                            }
                          >
                            <label>
                              {
                                campo
                              }
                            </label>

                            <input
                              type="text"
                              value={
                                formulario
                                  .metadatos?.[
                                  campo
                                ] ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                handleMetadataChange(
                                  campo,
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {recursoEditando && (
                  <div className="form-section">
                    <h3>
                      Estado automático
                      del inventario
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Prestado
                        </label>

                        <input
                          disabled
                          value={
                            recursoEditando.cantidadPrestada ||
                            0
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          En reparación
                        </label>

                        <input
                          disabled
                          value={
                            recursoEditando.cantidadEnReparacion ||
                            0
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Desecho
                        </label>

                        <input
                          disabled
                          value={
                            recursoEditando.cantidadDesecho ||
                            0
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Disponible
                        </label>

                        <input
                          disabled
                          value={calcularDisponible(
                            recursoEditando
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                      : recursoEditando
                        ? "Actualizar"
                        : "Crear recurso"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default RecursosPage;