import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  Filter,
  Mail,
  MapPin,
  Pencil,
  Phone,
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
  nitORuc: "",
  telefono: "",
  correo: "",
  direccion: "",
  activo: true,
};

const filtrosIniciales = {
  nombre: "",
  nitORuc: "",
  telefono: "",
  correo: "",
  direccion: "",
  activo: "",
};

const ProveedoresPage = () => {
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
    proveedores,
    setProveedores,
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
    proveedorEditando,
    setProveedorEditando,
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

  const obtenerProveedores =
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

        if (
          filtrosAplicados.telefono
            .trim()
        ) {
          params.telefono =
            filtrosAplicados.telefono.trim();
        }

        if (
          filtrosAplicados.correo
            .trim()
        ) {
          params.correo =
            filtrosAplicados.correo.trim();
        }

        if (
          filtrosAplicados.direccion
            .trim()
        ) {
          params.direccion =
            filtrosAplicados.direccion.trim();
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
            "/proveedores",
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

        setProveedores(
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
            "No se pudieron obtener los proveedores"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerProveedores();
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

  const abrirCrear = () => {
    setProveedorEditando(
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
    proveedor
  ) => {
    setProveedorEditando(
      proveedor
    );

    setFormulario({
      nombre:
        proveedor.nombre ||
        "",
      nitORuc:
        proveedor.nitORuc ||
        "",
      telefono:
        proveedor.telefono ||
        "",
      correo:
        proveedor.correo ||
        "",
      direccion:
        proveedor.direccion ||
        "",
      activo:
        proveedor.activo !==
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

      setProveedorEditando(
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
          "El nombre del proveedor es obligatorio"
        );

        return false;
      }

      if (
        !formulario.nitORuc.trim()
      ) {
        toast.error(
          "El NIT o RUC es obligatorio"
        );

        return false;
      }

      if (
        formulario.correo.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          formulario.correo.trim()
        )
      ) {
        toast.error(
          "Ingrese un correo válido"
        );

        return false;
      }

      return true;
    };

  const guardarProveedor =
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
          nitORuc:
            formulario.nitORuc.trim(),
          telefono:
            formulario.telefono.trim(),
          correo:
            formulario.correo
              .trim()
              .toLowerCase(),
          direccion:
            formulario.direccion.trim(),
          activo:
            formulario.activo,
        };

        if (
          proveedorEditando
        ) {
          await api.put(
            `/proveedores/${proveedorEditando._id}`,
            payload
          );

          toast.success(
            "Proveedor actualizado correctamente"
          );
        } else {
          await api.post(
            "/proveedores",
            payload
          );

          toast.success(
            "Proveedor creado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerProveedores();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el proveedor"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarProveedor =
    async (proveedor) => {
      if (!puedeGestionar) {
        return;
      }

      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar el proveedor "${proveedor.nombre}"?`
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/proveedores/${proveedor._id}`
        );

        toast.success(
          "Proveedor eliminado correctamente"
        );

        await obtenerProveedores();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el proveedor"
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
              Proveedores
            </h1>

            <p>
              Gestión de
              proveedores de
              recursos y servicios
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerProveedores
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
              Nuevo proveedor
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
                placeholder="Buscar proveedor"
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
                  filtros.nitORuc
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar NIT / RUC"
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
                  filtros.telefono
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar teléfono"
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
                Dirección
              </label>

              <input
                name="direccion"
                type="text"
                value={
                  filtros.direccion
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Buscar dirección"
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
            Cargando proveedores...
          </div>
        ) : proveedores.length ===
          0 ? (
          <div className="table-message">
            No hay proveedores que
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
                      Proveedor
                    </th>

                    <th>
                      NIT / RUC
                    </th>

                    <th>
                      Contacto
                    </th>

                    <th>
                      Dirección
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
                  {proveedores.map(
                    (
                      proveedor
                    ) => (
                      <tr
                        key={
                          proveedor._id
                        }
                      >
                        <td>
                          <div className="provider-name">
                            <div className="provider-icon">
                              <Building2
                                size={
                                  18
                                }
                              />
                            </div>

                            <strong>
                              {
                                proveedor.nombre
                              }
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">
                            {
                              proveedor.nitORuc
                            }
                          </span>
                        </td>

                        <td>
                          <div className="provider-contact">
                            {proveedor.telefono && (
                              <span>
                                <Phone
                                  size={
                                    14
                                  }
                                />

                                {
                                  proveedor.telefono
                                }
                              </span>
                            )}

                            {proveedor.correo && (
                              <span>
                                <Mail
                                  size={
                                    14
                                  }
                                />

                                {
                                  proveedor.correo
                                }
                              </span>
                            )}

                            {!proveedor.telefono &&
                              !proveedor.correo && (
                                <span className="muted-text">
                                  Sin contacto
                                </span>
                              )}
                          </div>
                        </td>

                        <td>
                          {proveedor.direccion ? (
                            <div className="provider-address">
                              <MapPin
                                size={
                                  14
                                }
                              />

                              <span>
                                {
                                  proveedor.direccion
                                }
                              </span>
                            </div>
                          ) : (
                            <span className="muted-text">
                              Sin dirección
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className={
                              proveedor.activo !==
                              false
                                ? "status-badge active"
                                : "status-badge inactive"
                            }
                          >
                            {proveedor.activo !==
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
                                    proveedor
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
                                  eliminarProveedor(
                                    proveedor
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
            <div className="modal-card modal-large">
              <div className="modal-header">
                <div>
                  <h2>
                    {proveedorEditando
                      ? "Editar proveedor"
                      : "Nuevo proveedor"}
                  </h2>

                  <p>
                    {proveedorEditando
                      ? "Modifique los datos del proveedor."
                      : "Complete la información para registrar un proveedor."}
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
                  guardarProveedor
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
                      placeholder="Nombre del proveedor"
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
                      placeholder="Ej. 2451-0000"
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
                      placeholder="proveedor@empresa.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Dirección
                  </label>

                  <textarea
                    name="direccion"
                    rows={3}
                    value={
                      formulario.direccion
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Dirección del proveedor"
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
                      Proveedor activo
                    </span>
                  </label>
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
                      : proveedorEditando
                        ? "Guardar cambios"
                        : "Crear proveedor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </section>
  );
};

export default ProveedoresPage;