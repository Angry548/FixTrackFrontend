import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
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

const estadoInicialFormulario = {
  nombre: "",
  direccion: "",
  telefono: "",
  nitORuc: "",
};

const filtrosIniciales = {
  nombre: "",
  nitORuc: "",
};

const EmpresasPage = () => {
  const {
    usuario,
  } = useAuth();

  const puedeGestionar =
    usuario?.rol ===
    "administrador";

  const [
    empresas,
    setEmpresas,
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
    empresaEditando,
    setEmpresaEditando,
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

  const obtenerEmpresas =
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
          filtrosAplicados.nitORuc
            .trim()
        ) {
          params.nitORuc =
            filtrosAplicados.nitORuc.trim();
        }

        const response =
          await api.get(
            "/empresas",
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

        setEmpresas(
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
            "No se pudieron obtener las empresas"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerEmpresas();
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
    } = event.target;

    setFormulario(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  const abrirCrear = () => {
    setEmpresaEditando(
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
    empresa
  ) => {
    setEmpresaEditando(
      empresa
    );

    setFormulario({
      nombre:
        empresa.nombre ||
        "",
      direccion:
        empresa.direccion ||
        "",
      telefono:
        empresa.telefono ||
        "",
      nitORuc:
        empresa.nitORuc ||
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

      setEmpresaEditando(
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
          "El nombre de la empresa es obligatorio"
        );

        return false;
      }

      if (
        !formulario.nitORuc.trim()
      ) {
        toast.error(
          "El NIT / RUC es obligatorio"
        );

        return false;
      }

      if (
        !formulario.direccion.trim()
      ) {
        toast.error(
          "La dirección es obligatoria"
        );

        return false;
      }

      if (
        !formulario.telefono.trim()
      ) {
        toast.error(
          "El teléfono es obligatorio"
        );

        return false;
      }

      return true;
    };

  const guardarEmpresa =
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
          direccion:
            formulario.direccion.trim(),
          telefono:
            formulario.telefono.trim(),
          nitORuc:
            formulario.nitORuc.trim(),
        };

        if (
          empresaEditando
        ) {
          await api.put(
            `/empresas/${empresaEditando._id}`,
            payload
          );

          toast.success(
            "Empresa actualizada correctamente"
          );
        } else {
          await api.post(
            "/empresas",
            payload
          );

          toast.success(
            "Empresa creada correctamente"
          );
        }

        cerrarFormulario();

        await obtenerEmpresas();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar la empresa"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarEmpresa =
    async (empresa) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar la empresa "${empresa.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/empresas/${empresa._id}`
        );

        toast.success(
          "Empresa eliminada correctamente"
        );

        await obtenerEmpresas();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar la empresa"
        );
      }
    };

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <Building2
            size={30}
          />

          <div>
            <h1>
              Empresas
            </h1>

            <p>
              Gestión de empresas
              registradas en
              FixTrack
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerEmpresas
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
              Nueva empresa
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
    onSubmit={aplicarFiltros}
  >
    <div className="form-grid">
      <div className="form-group">
        <label>
          Nombre
        </label>

        <input
          name="nombre"
          type="text"
          value={filtros.nombre}
          onChange={handleFiltroChange}
          placeholder="Buscar por nombre"
        />
      </div>

      <div className="form-group">
        <label>
          NIT / RUC
        </label>

        <input
          name="nitORuc"
          type="text"
          value={filtros.nitORuc}
          onChange={handleFiltroChange}
          placeholder="Buscar por NIT / RUC"
        />
      </div>

      <div className="filters-actions">
        <button
          type="submit"
          className="button-primary"
        >
          <Search size={17} />
          Buscar
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={limpiarFiltros}
        >
          <Filter size={17} />
          Limpiar
        </button>
      </div>
    </div>
  </form>
</div>

      <div className="data-card">
        {cargando ? (
          <div className="table-message">
            Cargando empresas...
          </div>
        ) : empresas.length ===
          0 ? (
          <div className="table-message">
            No hay empresas que
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
                      NIT / RUC
                    </th>

                    <th>
                      Dirección
                    </th>

                    <th>
                      Teléfono
                    </th>

                    {puedeGestionar && (
                      <th>
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {empresas.map(
                    (
                      empresa
                    ) => (
                      <tr
                        key={
                          empresa._id
                        }
                      >
                        <td>
                          <div className="resource-name">
                            <div className="resource-icon">
                              <Building2
                                size={
                                  18
                                }
                              />
                            </div>

                            <strong>
                              {
                                empresa.nombre
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">
                            {
                              empresa.nitORuc
                            }
                          </span>
                        </td>

                        <td>
                          {empresa.direccion ||
                            "—"}
                        </td>

                        <td>
                          {empresa.telefono ||
                            "—"}
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
                                    empresa
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
                                  eliminarEmpresa(
                                    empresa
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
                    {empresaEditando
                      ? "Editar empresa"
                      : "Nueva empresa"}
                  </h2>

                  <p>
                    {empresaEditando
                      ? "Modifique los datos de la empresa."
                      : "Complete los datos para registrar una empresa."}
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
                  guardarEmpresa
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
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div className="form-group">
                  <label>
                    NIT / RUC
                  </label>

                  <input
                    name="nitORuc"
                    type="text"
                    value={
                      formulario.nitORuc
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="NIT o RUC"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Dirección
                  </label>

                  <input
                    name="direccion"
                    type="text"
                    value={
                      formulario.direccion
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Dirección"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Teléfono
                  </label>

                  <input
                    name="telefono"
                    type="text"
                    value={
                      formulario.telefono
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="2451-0000"
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
                      : empresaEditando
                        ? "Guardar cambios"
                        : "Crear empresa"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default EmpresasPage;