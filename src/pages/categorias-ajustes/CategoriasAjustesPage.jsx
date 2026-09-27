import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  ClipboardList,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/common/Pagination.jsx";

const estadoInicialFormulario = {
  nombre: "",
  descripcion: "",
  afectaDesecho: false,
  activo: true,
};

const filtrosIniciales = {
  nombre: "",
  descripcion: "",
  activo: "",
};

const CategoriasAjustesPage =
  () => {
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
      categorias,
      setCategorias,
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
      categoriaEditando,
      setCategoriaEditando,
    ] = useState(null);

    const [
      formulario,
      setFormulario,
    ] = useState(
      estadoInicialFormulario
    );

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

    const obtenerCategorias =
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
              "/categorias-ajustes",
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

          setCategorias(
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
            error.response
              ?.data?.message ||
              "No se pudieron obtener las categorías de ajuste"
          );
        } finally {
          setCargando(
            false
          );
        }
      };

    useEffect(() => {
      obtenerCategorias();
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

    const abrirCrear =
      () => {
        setCategoriaEditando(
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
      categoria
    ) => {
      setCategoriaEditando(
        categoria
      );

      setFormulario({
        nombre:
          categoria.nombre ||
          "",
        descripcion:
          categoria.descripcion ||
          "",
        afectaDesecho:
          categoria.afectaDesecho ===
          true,
        activo:
          categoria.activo !==
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

        setCategoriaEditando(
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
            "El nombre de la categoría es obligatorio"
          );

          return false;
        }

        if (
          formulario.nombre
            .trim().length < 2
        ) {
          toast.error(
            "El nombre debe tener al menos 2 caracteres"
          );

          return false;
        }

        return true;
      };

    const guardarCategoria =
      async (event) => {
        event.preventDefault();

        if (
          !puedeGestionar
        ) {
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
          setGuardando(
            true
          );

          const payload = {
            nombre:
              formulario.nombre.trim(),
            descripcion:
              formulario.descripcion.trim(),
            afectaDesecho:
              categoriaEditando
                ? categoriaEditando.afectaDesecho ===
                  true
                : formulario.afectaDesecho,
            activo:
              formulario.activo,
          };

          if (
            categoriaEditando
          ) {
            await api.put(
              `/categorias-ajustes/${categoriaEditando._id}`,
              payload
            );

            toast.success(
              "Categoría actualizada correctamente"
            );
          } else {
            await api.post(
              "/categorias-ajustes",
              payload
            );

            toast.success(
              "Categoría creada correctamente"
            );
          }

          cerrarFormulario();

          await obtenerCategorias();
        } catch (error) {
          toast.error(
            error.response
              ?.data?.message ||
              "No se pudo guardar la categoría"
          );
        } finally {
          setGuardando(
            false
          );
        }
      };

    const cambiarEstado =
      async (
        categoria
      ) => {
        if (
          !puedeGestionar
        ) {
          return;
        }

        const nuevoEstado =
          categoria.activo ===
          false;

        const accion =
          nuevoEstado
            ? "activar"
            : "desactivar";

        const confirmar =
          window.confirm(
            `¿Desea ${accion} la categoría "${categoria.nombre}"?`
          );

        if (
          !confirmar
        ) {
          return;
        }

        try {
          await api.patch(
            `/categorias-ajustes/${categoria._id}/estado`,
            {
              activo:
                nuevoEstado,
            }
          );

          toast.success(
            `Categoría ${
              nuevoEstado
                ? "activada"
                : "desactivada"
            } correctamente`
          );

          await obtenerCategorias();
        } catch (error) {
          toast.error(
            error.response
              ?.data?.message ||
              "No se pudo cambiar el estado"
          );
        }
      };

    const eliminarCategoria =
      async (
        categoria
      ) => {
        if (
          !puedeGestionar
        ) {
          return;
        }

        const confirmar =
          window.confirm(
            `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`
          );

        if (
          !confirmar
        ) {
          return;
        }

        try {
          await api.delete(
            `/categorias-ajustes/${categoria._id}`
          );

          toast.success(
            "Categoría eliminada correctamente"
          );

          await obtenerCategorias();
        } catch (error) {
          toast.error(
            error.response
              ?.data?.message ||
              "No se pudo eliminar la categoría"
          );
        }
      };

    return (
      <section className="module-page">
        <div className="module-header">
          <div className="module-title">
            <ClipboardList
              size={30}
            />

            <div>
              <h1>
                Categorías de
                Ajustes
              </h1>

              <p>
                Catálogo de
                movimientos y
                categorías de
                desecho
              </p>
            </div>
          </div>

          <div className="module-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={
                obtenerCategorias
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
                Nueva categoría
              </button>
            )}
          </div>
        </div>

        {!puedeGestionar && (
          <div className="permission-info">
            Su rol tiene acceso
            de solo lectura en
            este módulo.
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
                  value={
                    filtros.nombre
                  }
                  onChange={
                    handleFiltroChange
                  }
                  placeholder="Buscar categoría"
                />
              </div>

              <div className="form-group">
                <label>
                  Descripción
                </label>

                <input
                  name="descripcion"
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
                    Activas
                  </option>

                  <option value="false">
                    Inactivas
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
              Cargando categorías...
            </div>
          ) : categorias.length ===
            0 ? (
            <div className="table-message">
              No hay categorías
              para mostrar.
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Categoría
                      </th>

                      <th>
                        Descripción
                      </th>

                      <th>
                        Efecto
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
                    {categorias.map(
                      (
                        categoria
                      ) => (
                        <tr
                          key={
                            categoria._id
                          }
                        >
                          <td>
                            <div className="adjustment-category-name">
                              <div className="adjustment-category-icon">
                                <ClipboardList
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <strong>
                                {
                                  categoria.nombre
                                }
                              </strong>
                            </div>
                          </td>

                          <td>
                            {categoria.descripcion ||
                              "—"}
                          </td>

                          <td>
                            {categoria.afectaDesecho ? (
                              <span className="status-badge inactive">
                                Desecho /
                                baja
                              </span>
                            ) : (
                              <span className="status-badge active">
                                Movimiento
                                normal
                              </span>
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                categoria.activo !==
                                false
                                  ? "status-badge active"
                                  : "status-badge inactive"
                              }
                            >
                              {categoria.activo !==
                              false ? (
                                <>
                                  <CheckCircle2
                                    size={
                                      14
                                    }
                                  />
                                  Activa
                                </>
                              ) : (
                                <>
                                  <XCircle
                                    size={
                                      14
                                    }
                                  />
                                  Inactiva
                                </>
                              )}
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
                                      categoria
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
                                    categoria.activo !==
                                    false
                                      ? "icon-button warning"
                                      : "icon-button success"
                                  }
                                  title={
                                    categoria.activo !==
                                    false
                                      ? "Desactivar"
                                      : "Activar"
                                  }
                                  onClick={() =>
                                    cambiarEstado(
                                      categoria
                                    )
                                  }
                                >
                                  {categoria.activo !==
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
                                  onClick={() =>
                                    eliminarCategoria(
                                      categoria
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
                      {categoriaEditando
                        ? "Editar categoría"
                        : "Nueva categoría"}
                    </h2>

                    <p>
                      Configure el
                      comportamiento del
                      movimiento de
                      inventario.
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
                    guardarCategoria
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
                      placeholder="Ej. Desecho por obsolescencia"
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
                      placeholder="Descripción del tipo de ajuste"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Comportamiento
                    </label>

                    <label className="checkbox-field">
                      <input
                        name="afectaDesecho"
                        type="checkbox"
                        checked={
                          formulario.afectaDesecho
                        }
                        onChange={
                          handleChange
                        }
                        disabled={
                          Boolean(
                            categoriaEditando
                          )
                        }
                      />

                      <span>
                        Esta categoría
                        representa desecho
                        o baja de recursos
                      </span>
                    </label>
                  </div>

                  {formulario.afectaDesecho && (
                    <div className="permission-info">
                      Las salidas con
                      esta categoría
                      aumentarán
                      automáticamente
                      cantidadDesecho. No
                      reducirán
                      existenciaTotal,
                      evitando descontar
                      dos veces el
                      recurso.
                    </div>
                  )}

                  {categoriaEditando && (
                    <div className="permission-info">
                      El comportamiento
                      de desecho no puede
                      modificarse después
                      de crear la
                      categoría porque
                      podría alterar
                      movimientos de
                      inventario ya
                      registrados.
                    </div>
                  )}

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
                        Categoría activa
                      </span>
                    </label>
                  </div>

                  <div className="category-example-box">
                    <strong>
                      Ejemplos
                    </strong>

                    <div className="category-example-list">
                      <span>
                        Compra a
                        proveedor →
                        normal
                      </span>

                      <span>
                        Entrada inicial
                        → normal
                      </span>

                      <span>
                        Salida
                        administrativa →
                        normal
                      </span>

                      <span>
                        Desecho →
                        afecta desecho
                      </span>

                      <span>
                        Obsolescencia →
                        afecta desecho
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
                        : categoriaEditando
                          ? "Guardar cambios"
                          : "Crear categoría"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </section>
    );
  };

export default CategoriasAjustesPage;