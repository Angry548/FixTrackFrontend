import {
  useEffect,
  useState,
} from "react";

import {
  Building,
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
  descripcion: "",
  empresaId: "",
};

const filtrosIniciales = {
  nombre: "",
  descripcion: "",
};

const DepartamentosPage = () => {
  const {
    usuario,
  } = useAuth();

  const puedeGestionar =
    usuario?.rol ===
    "administrador";

  const [
    departamentos,
    setDepartamentos,
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
    departamentoEditando,
    setDepartamentoEditando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    empresaFormulario,
    setEmpresaFormulario,
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
    empresaFiltro,
    setEmpresaFiltro,
  ] = useState(null);

  const [
    empresaFiltroAplicado,
    setEmpresaFiltroAplicado,
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

  const obtenerDepartamentos =
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
          empresaFiltroAplicado?._id
        ) {
          params.empresaId =
            empresaFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/departamentos",
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

        setDepartamentos(
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
            "No se pudieron obtener los departamentos"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerDepartamentos();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    empresaFiltroAplicado,
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

      setEmpresaFiltroAplicado(
        empresaFiltro
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

      setEmpresaFiltro(null);

      setEmpresaFiltroAplicado(
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

  const seleccionarEmpresaFormulario =
    (empresa) => {
      setEmpresaFormulario(
        empresa || null
      );

      setFormulario(
        (prev) => ({
          ...prev,
          empresaId:
            empresa?._id ||
            "",
        })
      );
    };

  const abrirCrear = () => {
    setDepartamentoEditando(
      null
    );

    setEmpresaFormulario(
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
    departamento
  ) => {
    setDepartamentoEditando(
      departamento
    );

    const empresa =
      departamento.empresaId &&
      typeof departamento.empresaId ===
        "object"
        ? departamento.empresaId
        : null;

    setEmpresaFormulario(
      empresa
    );

    setFormulario({
      nombre:
        departamento.nombre ||
        "",
      descripcion:
        departamento.descripcion ||
        "",
      empresaId:
        empresa?._id ||
        departamento.empresaId ||
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

      setDepartamentoEditando(
        null
      );

      setEmpresaFormulario(
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
          "El nombre del departamento es obligatorio"
        );

        return false;
      }

      if (
        !formulario.empresaId
      ) {
        toast.error(
          "Debe seleccionar una empresa"
        );

        return false;
      }

      return true;
    };

  const guardarDepartamento =
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
          empresaId:
            formulario.empresaId,
        };

        if (
          departamentoEditando
        ) {
          await api.put(
            `/departamentos/${departamentoEditando._id}`,
            payload
          );

          toast.success(
            "Departamento actualizado correctamente"
          );
        } else {
          await api.post(
            "/departamentos",
            payload
          );

          toast.success(
            "Departamento creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerDepartamentos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el departamento"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarDepartamento =
    async (
      departamento
    ) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar el departamento "${departamento.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/departamentos/${departamento._id}`
        );

        toast.success(
          "Departamento eliminado correctamente"
        );

        await obtenerDepartamentos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el departamento"
        );
      }
    };

  const obtenerNombreEmpresa =
    (departamento) => {
      if (
        departamento.empresaId &&
        typeof departamento.empresaId ===
          "object"
      ) {
        return (
          departamento
            .empresaId
            .nombre ||
          "Sin empresa"
        );
      }

      return "Sin empresa";
    };

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <Building
            size={30}
          />

          <div>
            <h1>
              Departamentos
            </h1>

            <p>
              Gestión de
              departamentos
              asociados a las
              empresas de FixTrack
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerDepartamentos
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
              Nuevo departamento
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
                Empresa
              </label>

              <SearchableSelect
                endpoint="/empresas"
                selectedOption={
                  empresaFiltro
                }
                onChange={
                  setEmpresaFiltro
                }
                placeholder="Buscar empresa..."
                getOptionValue={(
                  empresa
                ) =>
                  empresa._id
                }
                getOptionLabel={(
                  empresa
                ) =>
                  empresa.nombre
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
            Cargando departamentos...
          </div>
        ) : departamentos.length ===
          0 ? (
          <div className="table-message">
            No hay departamentos
            que coincidan con los
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
                  {departamentos.map(
                    (
                      departamento
                    ) => (
                      <tr
                        key={
                          departamento._id
                        }
                      >
                        <td>
                          <div className="resource-name">
                            <div className="resource-icon">
                              <Building
                                size={
                                  18
                                }
                              />
                            </div>

                            <strong>
                              {
                                departamento.nombre
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          {departamento.descripcion ||
                            "—"}
                        </td>

                        <td>
                          {obtenerNombreEmpresa(
                            departamento
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
                                    departamento
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
                                  eliminarDepartamento(
                                    departamento
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
                    {departamentoEditando
                      ? "Editar departamento"
                      : "Nuevo departamento"}
                  </h2>

                  <p>
                    {departamentoEditando
                      ? "Modifique los datos del departamento."
                      : "Complete los datos para registrar un departamento."}
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
                  guardarDepartamento
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
                    placeholder="Nombre del departamento"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Descripción
                  </label>

                  <textarea
                    name="descripcion"
                    value={
                      formulario.descripcion
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Descripción del departamento"
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Empresa
                  </label>

                  <SearchableSelect
                    endpoint="/empresas"
                    selectedOption={
                      empresaFormulario
                    }
                    onChange={
                      seleccionarEmpresaFormulario
                    }
                    placeholder="Buscar empresa..."
                    getOptionValue={(
                      empresa
                    ) =>
                      empresa._id
                    }
                    getOptionLabel={(
                      empresa
                    ) =>
                      empresa.nombre
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
                      : departamentoEditando
                        ? "Guardar cambios"
                        : "Crear departamento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default DepartamentosPage;