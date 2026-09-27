import {
  useEffect,
  useState,
} from "react";

import {
  Boxes,
  Filter,
  Layers3,
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
  recursosAsociados: [],
  activo: true,
};

const filtrosIniciales = {
  nombre: "",
  descripcion: "",
  activo: "",
};

const GruposRecursosPage = () => {
  const {
    usuario,
  } = useAuth();

  const puedeGestionar = [
    "administrador",
    "inventario",
  ].includes(
    usuario?.rol
  );

  const [
    grupos,
    setGrupos,
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
    grupoEditando,
    setGrupoEditando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    recursosSeleccionados,
    setRecursosSeleccionados,
  ] = useState([]);

  const [
    recursoParaAgregar,
    setRecursoParaAgregar,
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

  const obtenerGrupos =
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
          filtrosAplicados.activo !==
          ""
        ) {
          params.activo =
            filtrosAplicados.activo;
        }

        const response =
          await api.get(
            "/grupos-recursos",
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

        setGrupos(
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
            "No se pudieron obtener los grupos de recursos"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerGrupos();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
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
    };

  const limpiarFiltros =
    () => {
      setFiltros(
        filtrosIniciales
      );

      setFiltrosAplicados(
        filtrosIniciales
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

  const sincronizarIds =
    (recursos) => {
      setRecursosSeleccionados(
        recursos
      );

      setFormulario(
        (prev) => ({
          ...prev,
          recursosAsociados:
            recursos.map(
              (recurso) =>
                recurso._id
            ),
        })
      );
    };

  const agregarRecurso =
    (recurso) => {
      if (!recurso) {
        setRecursoParaAgregar(
          null
        );

        return;
      }

      const existe =
        recursosSeleccionados.some(
          (item) =>
            item._id ===
            recurso._id
        );

      if (existe) {
        toast.error(
          "Ese recurso ya se encuentra asociado al grupo"
        );

        setRecursoParaAgregar(
          null
        );

        return;
      }

      sincronizarIds([
        ...recursosSeleccionados,
        recurso,
      ]);

      setRecursoParaAgregar(
        null
      );
    };

  const quitarRecurso =
    (recursoId) => {
      sincronizarIds(
        recursosSeleccionados.filter(
          (recurso) =>
            recurso._id !==
            recursoId
        )
      );
    };

  const abrirCrear = () => {
    setGrupoEditando(null);

    setFormulario({
      ...estadoInicialFormulario,
      recursosAsociados: [],
    });

    setRecursosSeleccionados(
      []
    );

    setRecursoParaAgregar(
      null
    );

    setMostrarFormulario(
      true
    );
  };

  const abrirEditar = (
    grupo
  ) => {
    setGrupoEditando(
      grupo
    );

    const recursos =
      Array.isArray(
        grupo.recursosAsociados
      )
        ? grupo.recursosAsociados
            .filter(
              (recurso) =>
                recurso &&
                typeof recurso ===
                  "object" &&
                recurso._id
            )
        : [];

    const ids =
      Array.isArray(
        grupo.recursosAsociados
      )
        ? grupo.recursosAsociados
            .map(
              (recurso) =>
                typeof recurso ===
                "object"
                  ? recurso._id
                  : recurso
            )
            .filter(Boolean)
        : [];

    setFormulario({
      nombre:
        grupo.nombre || "",
      descripcion:
        grupo.descripcion ||
        "",
      recursosAsociados:
        ids,
      activo:
        grupo.activo !==
        false,
    });

    setRecursosSeleccionados(
      recursos
    );

    setRecursoParaAgregar(
      null
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

      setGrupoEditando(null);

      setFormulario({
        ...estadoInicialFormulario,
        recursosAsociados: [],
      });

      setRecursosSeleccionados(
        []
      );

      setRecursoParaAgregar(
        null
      );
    };

  const validarFormulario =
    () => {
      if (
        !formulario.nombre.trim()
      ) {
        toast.error(
          "El nombre del grupo es obligatorio"
        );

        return false;
      }

      if (
        formulario
          .recursosAsociados
          .length === 0
      ) {
        toast.error(
          "Debe seleccionar al menos un recurso"
        );

        return false;
      }

      return true;
    };

  const guardarGrupo =
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
          recursosAsociados:
            formulario.recursosAsociados,
          activo:
            formulario.activo,
        };

        if (
          grupoEditando
        ) {
          await api.put(
            `/grupos-recursos/${grupoEditando._id}`,
            payload
          );

          toast.success(
            "Grupo actualizado correctamente"
          );
        } else {
          await api.post(
            "/grupos-recursos",
            payload
          );

          toast.success(
            "Grupo creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerGrupos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el grupo"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarGrupo =
    async (grupo) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar el grupo "${grupo.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/grupos-recursos/${grupo._id}`
        );

        toast.success(
          "Grupo eliminado correctamente"
        );

        await obtenerGrupos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el grupo"
        );
      }
    };

  const obtenerRecursosGrupo =
    (grupo) => {
      if (
        !Array.isArray(
          grupo.recursosAsociados
        )
      ) {
        return [];
      }

      return grupo.recursosAsociados
        .filter(
          (recurso) =>
            recurso &&
            typeof recurso ===
              "object"
        );
    };

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <Layers3
            size={30}
          />

          <div>
            <h1>
              Grupos de Recursos
            </h1>

            <p>
              Agrupación lógica
              de recursos del
              inventario
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerGrupos
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
              Nuevo grupo
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
                placeholder="Buscar grupo"
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
            Cargando grupos...
          </div>
        ) : grupos.length ===
          0 ? (
          <div className="table-message">
            No hay grupos que
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
                      Grupo
                    </th>

                    <th>
                      Descripción
                    </th>

                    <th>
                      Recursos
                    </th>

                    <th>
                      Cantidad
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
                  {grupos.map(
                    (grupo) => {
                      const recursosGrupo =
                        obtenerRecursosGrupo(
                          grupo
                        );

                      const cantidadRecursos =
                        Array.isArray(
                          grupo.recursosAsociados
                        )
                          ? grupo
                              .recursosAsociados
                              .length
                          : 0;

                      return (
                        <tr
                          key={
                            grupo._id
                          }
                        >
                          <td>
                            <div className="group-name">
                              <div className="group-icon">
                                <Boxes
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <strong>
                                {
                                  grupo.nombre
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            {grupo.descripcion ||
                              "—"}
                          </td>

                          <td>
                            {recursosGrupo.length >
                            0 ? (
                              <div className="tag-list">
                                {recursosGrupo.map(
                                  (
                                    recurso
                                  ) => (
                                    <span
                                      key={
                                        recurso._id
                                      }
                                      className="resource-tag"
                                    >
                                      {
                                        recurso.nombre
                                      }
                                    </span>
                                  )
                                )}
                              </div>
                            ) : cantidadRecursos >
                              0 ? (
                              <span className="muted-text">
                                {cantidadRecursos}{" "}
                                recurso(s)
                              </span>
                            ) : (
                              <span className="muted-text">
                                Sin recursos
                              </span>
                            )}
                          </td>

                          <td>
                            <span className="assignment-badge">
                              {
                                cantidadRecursos
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                grupo.activo !==
                                false
                                  ? "status-badge active"
                                  : "status-badge inactive"
                              }
                            >
                              {grupo.activo !==
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
                                      grupo
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
                                    eliminarGrupo(
                                      grupo
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
                      );
                    }
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
            <div className="modal-card modal-large">
              <div className="modal-header">
                <div>
                  <h2>
                    {grupoEditando
                      ? "Editar grupo"
                      : "Nuevo grupo"}
                  </h2>

                  <p>
                    Busque y agregue
                    los recursos que
                    formarán parte del
                    grupo.
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
                  guardarGrupo
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
                      placeholder="Ej. Estación Administrativa 01"
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
                        Grupo activo
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
                    placeholder="Descripción del grupo"
                  />
                </div>

                <div className="form-section">
                  <div className="resource-selector-header">
                    <div>
                      <h3>
                        Recursos
                        asociados
                      </h3>

                      <span>
                        {
                          formulario
                            .recursosAsociados
                            .length
                        }{" "}
                        seleccionado(s)
                      </span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Agregar recurso
                    </label>

                    <SearchableSelect
                      endpoint="/recursos?activo=true"
                      selectedOption={
                        recursoParaAgregar
                      }
                      onChange={
                        agregarRecurso
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

                  {recursosSeleccionados.length ===
                  0 ? (
                    <div className="metadata-empty">
                      No ha agregado
                      recursos al grupo.
                    </div>
                  ) : (
                    <div className="resource-selector">
                      {recursosSeleccionados.map(
                        (
                          recurso
                        ) => (
                          <div
                            key={
                              recurso._id
                            }
                            className="resource-option selected"
                          >
                            <div className="resource-option-icon">
                              <Boxes
                                size={
                                  18
                                }
                              />
                            </div>

                            <div className="resource-option-info">
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

                            <button
                              type="button"
                              className="icon-button danger"
                              title="Quitar recurso"
                              onClick={() =>
                                quitarRecurso(
                                  recurso._id
                                )
                              }
                            >
                              <X
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
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
                      : grupoEditando
                        ? "Guardar cambios"
                        : "Crear grupo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default GruposRecursosPage;