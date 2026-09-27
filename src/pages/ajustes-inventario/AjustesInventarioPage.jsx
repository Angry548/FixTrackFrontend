import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardPlus,
  Eye,
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

const crearDetalleVacio = () => ({
  recursoId: "",
  recurso: null,
  tipoMovimiento: "entrada",
  cantidad: 1,
  costoUnitario: 0,
});

const estadoInicialFormulario = {
  numeroDocumento: "",
  fecha: new Date()
    .toISOString()
    .split("T")[0],
  justificacion: "",
  categoriaAjusteId: "",
  proveedorId: "",
  detalleAjuste: [
    crearDetalleVacio(),
  ],
};

const filtrosIniciales = {
  numeroDocumento: "",
  justificacion: "",
  tipoMovimiento: "",
  fechaDesde: "",
  fechaHasta: "",
};

const AjustesInventarioPage =
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
      ajustes,
      setAjustes,
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
      mostrarDetalle,
      setMostrarDetalle,
    ] = useState(false);

    const [
      ajusteEditando,
      setAjusteEditando,
    ] = useState(null);

    const [
      ajusteVisualizando,
      setAjusteVisualizando,
    ] = useState(null);

    const [
      formulario,
      setFormulario,
    ] = useState(
      estadoInicialFormulario
    );

    const [
      categoriaFormulario,
      setCategoriaFormulario,
    ] = useState(null);

    const [
      proveedorFormulario,
      setProveedorFormulario,
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
      categoriaFiltro,
      setCategoriaFiltro,
    ] = useState(null);

    const [
      proveedorFiltro,
      setProveedorFiltro,
    ] = useState(null);

    const [
      recursoFiltro,
      setRecursoFiltro,
    ] = useState(null);

    const [
      categoriaFiltroAplicado,
      setCategoriaFiltroAplicado,
    ] = useState(null);

    const [
      proveedorFiltroAplicado,
      setProveedorFiltroAplicado,
    ] = useState(null);

    const [
      recursoFiltroAplicado,
      setRecursoFiltroAplicado,
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

    const obtenerAjustes =
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
            filtrosAplicados
              .numeroDocumento
              .trim()
          ) {
            params.numeroDocumento =
              filtrosAplicados
                .numeroDocumento
                .trim();
          }

          if (
            filtrosAplicados
              .justificacion
              .trim()
          ) {
            params.justificacion =
              filtrosAplicados
                .justificacion
                .trim();
          }

          if (
            filtrosAplicados
              .tipoMovimiento
          ) {
            params.tipoMovimiento =
              filtrosAplicados
                .tipoMovimiento;
          }

          if (
            filtrosAplicados
              .fechaDesde
          ) {
            params.fechaDesde =
              filtrosAplicados
                .fechaDesde;
          }

          if (
            filtrosAplicados
              .fechaHasta
          ) {
            params.fechaHasta =
              filtrosAplicados
                .fechaHasta;
          }

          if (
            categoriaFiltroAplicado?._id
          ) {
            params.categoriaAjusteId =
              categoriaFiltroAplicado._id;
          }

          if (
            proveedorFiltroAplicado?._id
          ) {
            params.proveedorId =
              proveedorFiltroAplicado._id;
          }

          if (
            recursoFiltroAplicado?._id
          ) {
            params.recursoId =
              recursoFiltroAplicado._id;
          }

          const response =
            await api.get(
              "/ajustes-inventario",
              {
                params,
              }
            );

          const registros =
            obtenerData(
              response
            );

          setAjustes(
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
              "No se pudieron obtener los ajustes"
          );
        } finally {
          setCargando(
            false
          );
        }
      };

    useEffect(() => {
      obtenerAjustes();
    }, [
      paginaActual,
      registrosPorPagina,
      filtrosAplicados,
      categoriaFiltroAplicado,
      proveedorFiltroAplicado,
      recursoFiltroAplicado,
    ]);

    const categoriaEsDesecho =
      categoriaFormulario
        ?.afectaDesecho ===
      true;

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

        setCategoriaFiltroAplicado(
          categoriaFiltro
        );

        setProveedorFiltroAplicado(
          proveedorFiltro
        );

        setRecursoFiltroAplicado(
          recursoFiltro
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

        setCategoriaFiltro(
          null
        );

        setProveedorFiltro(
          null
        );

        setRecursoFiltro(
          null
        );

        setCategoriaFiltroAplicado(
          null
        );

        setProveedorFiltroAplicado(
          null
        );

        setRecursoFiltroAplicado(
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

    const seleccionarCategoria =
      (categoria) => {
        setCategoriaFormulario(
          categoria || null
        );

        setFormulario(
          (prev) => ({
            ...prev,
            categoriaAjusteId:
              categoria?._id ||
              "",
            detalleAjuste:
              prev.detalleAjuste.map(
                (detalle) => ({
                  ...detalle,
                  tipoMovimiento:
                    categoria
                      ?.afectaDesecho
                      ? "salida"
                      : detalle.tipoMovimiento,
                })
              ),
          })
        );
      };

    const seleccionarProveedor =
      (proveedor) => {
        setProveedorFormulario(
          proveedor || null
        );

        setFormulario(
          (prev) => ({
            ...prev,
            proveedorId:
              proveedor?._id ||
              "",
          })
        );
      };

    const seleccionarRecurso =
      (
        index,
        recurso
      ) => {
        setFormulario(
          (prev) => ({
            ...prev,
            detalleAjuste:
              prev.detalleAjuste.map(
                (
                  detalle,
                  detalleIndex
                ) =>
                  detalleIndex ===
                  index
                    ? {
                        ...detalle,
                        recursoId:
                          recurso?._id ||
                          "",
                        recurso:
                          recurso ||
                          null,
                      }
                    : detalle
              ),
          })
        );
      };

    const handleDetalleChange =
      (
        index,
        campo,
        valor
      ) => {
        setFormulario(
          (prev) => ({
            ...prev,
            detalleAjuste:
              prev.detalleAjuste.map(
                (
                  detalle,
                  detalleIndex
                ) =>
                  detalleIndex ===
                  index
                    ? {
                        ...detalle,
                        [campo]:
                          campo ===
                            "cantidad" ||
                          campo ===
                            "costoUnitario"
                            ? valor ===
                              ""
                              ? ""
                              : Number(
                                  valor
                                )
                            : valor,
                      }
                    : detalle
              ),
          })
        );
      };

    const agregarDetalle =
      () => {
        if (
          ajusteEditando
        ) {
          return;
        }

        setFormulario(
          (prev) => ({
            ...prev,
            detalleAjuste: [
              ...prev.detalleAjuste,
              {
                ...crearDetalleVacio(),
                tipoMovimiento:
                  categoriaEsDesecho
                    ? "salida"
                    : "entrada",
              },
            ],
          })
        );
      };

    const eliminarDetalle =
      (index) => {
        if (
          ajusteEditando
        ) {
          return;
        }

        if (
          formulario
            .detalleAjuste
            .length === 1
        ) {
          toast.error(
            "El ajuste debe contener al menos un detalle"
          );

          return;
        }

        setFormulario(
          (prev) => ({
            ...prev,
            detalleAjuste:
              prev.detalleAjuste.filter(
                (
                  _,
                  detalleIndex
                ) =>
                  detalleIndex !==
                  index
              ),
          })
        );
      };

    const abrirCrear =
      () => {
        setAjusteEditando(
          null
        );

        setCategoriaFormulario(
          null
        );

        setProveedorFormulario(
          null
        );

        setFormulario({
          ...estadoInicialFormulario,
          fecha: new Date()
            .toISOString()
            .split("T")[0],
          detalleAjuste: [
            crearDetalleVacio(),
          ],
        });

        setMostrarFormulario(
          true
        );
      };

    const abrirEditar = (
      ajuste
    ) => {
      setAjusteEditando(
        ajuste
      );

      const categoria =
        ajuste.categoriaAjusteId &&
        typeof ajuste.categoriaAjusteId ===
          "object"
          ? ajuste.categoriaAjusteId
          : null;

      const proveedor =
        ajuste.proveedorId &&
        typeof ajuste.proveedorId ===
          "object"
          ? ajuste.proveedorId
          : null;

      setCategoriaFormulario(
        categoria
      );

      setProveedorFormulario(
        proveedor
      );

      const detalles =
        Array.isArray(
          ajuste.detalleAjuste
        )
          ? ajuste.detalleAjuste.map(
              (detalle) => {
                const recurso =
                  detalle.recursoId &&
                  typeof detalle.recursoId ===
                    "object"
                    ? detalle.recursoId
                    : null;

                return {
                  recursoId:
                    recurso?._id ||
                    detalle.recursoId ||
                    "",
                  recurso,
                  tipoMovimiento:
                    detalle.tipoMovimiento ||
                    "entrada",
                  cantidad:
                    detalle.cantidad ??
                    1,
                  costoUnitario:
                    normalizarDecimal(
                      detalle.costoUnitario
                    ),
                };
              }
            )
          : [];

      setFormulario({
        numeroDocumento:
          ajuste.numeroDocumento ||
          "",
        fecha:
          ajuste.fecha
            ? new Date(
                ajuste.fecha
              )
                .toISOString()
                .split("T")[0]
            : "",
        justificacion:
          ajuste.justificacion ||
          "",
        categoriaAjusteId:
          categoria?._id ||
          ajuste.categoriaAjusteId ||
          "",
        proveedorId:
          proveedor?._id ||
          ajuste.proveedorId ||
          "",
        detalleAjuste:
          detalles.length > 0
            ? detalles
            : [
                crearDetalleVacio(),
              ],
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

        setAjusteEditando(
          null
        );

        setCategoriaFormulario(
          null
        );

        setProveedorFormulario(
          null
        );

        setFormulario({
          ...estadoInicialFormulario,
          fecha: new Date()
            .toISOString()
            .split("T")[0],
          detalleAjuste: [
            crearDetalleVacio(),
          ],
        });
      };

    const abrirDetalle = (
      ajuste
    ) => {
      setAjusteVisualizando(
        ajuste
      );

      setMostrarDetalle(
        true
      );
    };

    const cerrarDetalle =
      () => {
        setAjusteVisualizando(
          null
        );

        setMostrarDetalle(
          false
        );
      };

    const calcularDisponible =
      (recurso) => {
        if (!recurso) {
          return 0;
        }

        return Math.max(
          0,
          Number(
            recurso.existenciaTotal ||
              0
          ) -
            Number(
              recurso.cantidadPrestada ||
                0
            ) -
            Number(
              recurso.cantidadEnReparacion ||
                0
            ) -
            Number(
              recurso.cantidadDesecho ||
                0
            )
        );
      };

    const validarFormulario =
      () => {
        if (
          !formulario
            .numeroDocumento
            .trim()
        ) {
          toast.error(
            "El número de documento es obligatorio"
          );

          return false;
        }

        if (
          !formulario.fecha
        ) {
          toast.error(
            "La fecha es obligatoria"
          );

          return false;
        }

        if (
          !formulario
            .categoriaAjusteId
        ) {
          toast.error(
            "Debe seleccionar una categoría de ajuste"
          );

          return false;
        }

        if (
          !formulario
            .justificacion
            .trim()
        ) {
          toast.error(
            "La justificación es obligatoria"
          );

          return false;
        }

        if (
          ajusteEditando
        ) {
          return true;
        }

        if (
          !Array.isArray(
            formulario.detalleAjuste
          ) ||
          formulario
            .detalleAjuste
            .length === 0
        ) {
          toast.error(
            "Debe agregar al menos un detalle"
          );

          return false;
        }

        for (
          let index = 0;
          index <
          formulario
            .detalleAjuste
            .length;
          index++
        ) {
          const detalle =
            formulario
              .detalleAjuste[
              index
            ];

          if (
            !detalle.recursoId
          ) {
            toast.error(
              `Seleccione un recurso en el detalle ${
                index + 1
              }`
            );

            return false;
          }

          if (
            ![
              "entrada",
              "salida",
            ].includes(
              detalle.tipoMovimiento
            )
          ) {
            toast.error(
              `Tipo de movimiento inválido en el detalle ${
                index + 1
              }`
            );

            return false;
          }

          if (
            categoriaEsDesecho &&
            detalle.tipoMovimiento !==
              "salida"
          ) {
            toast.error(
              "Las categorías de desecho solo permiten movimientos de salida"
            );

            return false;
          }

          const cantidad =
            Number(
              detalle.cantidad
            );

          if (
            !Number.isInteger(
              cantidad
            ) ||
            cantidad <= 0
          ) {
            toast.error(
              `La cantidad del detalle ${
                index + 1
              } debe ser un entero mayor que cero`
            );

            return false;
          }

          if (
            Number(
              detalle.costoUnitario
            ) < 0
          ) {
            toast.error(
              `El costo del detalle ${
                index + 1
              } no puede ser negativo`
            );

            return false;
          }

          if (
            detalle.tipoMovimiento ===
            "salida"
          ) {
            const disponible =
              calcularDisponible(
                detalle.recurso
              );

            if (
              cantidad >
              disponible
            ) {
              toast.error(
                `No hay suficiente disponibilidad de ${
                  detalle
                    .recurso
                    ?.nombre ||
                  "este recurso"
                }. Disponible: ${disponible}`
              );

              return false;
            }
          }
        }

        return true;
      };

    const guardarAjuste =
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

          if (
            ajusteEditando
          ) {
            const payload = {
              numeroDocumento:
                formulario
                  .numeroDocumento
                  .trim(),
              fecha:
                formulario.fecha,
              justificacion:
                formulario
                  .justificacion
                  .trim(),
              proveedorId:
                formulario
                  .proveedorId ||
                null,
            };

            await api.put(
              `/ajustes-inventario/${ajusteEditando._id}`,
              payload
            );

            toast.success(
              "Ajuste actualizado correctamente"
            );
          } else {
            const payload = {
              numeroDocumento:
                formulario
                  .numeroDocumento
                  .trim(),
              fecha:
                formulario.fecha,
              justificacion:
                formulario
                  .justificacion
                  .trim(),
              categoriaAjusteId:
                formulario
                  .categoriaAjusteId,
              proveedorId:
                formulario
                  .proveedorId ||
                null,
              proveedor:
                proveedorFormulario
                  ?.nombre ||
                "",
              detalleAjuste:
                formulario.detalleAjuste.map(
                  (
                    detalle
                  ) => ({
                    recursoId:
                      detalle.recursoId,
                    tipoMovimiento:
                      categoriaEsDesecho
                        ? "salida"
                        : detalle.tipoMovimiento,
                    cantidad:
                      Number(
                        detalle.cantidad
                      ),
                    costoUnitario:
                      Number(
                        detalle.costoUnitario ||
                          0
                      ),
                  })
                ),
            };

            await api.post(
              "/ajustes-inventario",
              payload
            );

            toast.success(
              categoriaEsDesecho
                ? "Desecho registrado correctamente"
                : "Ajuste registrado correctamente"
            );
          }

          cerrarFormulario();

          await obtenerAjustes();
        } catch (error) {
          toast.error(
            error.response
              ?.data?.message ||
              "No se pudo guardar el ajuste"
          );
        } finally {
          setGuardando(
            false
          );
        }
      };

    const eliminarAjuste =
      async (ajuste) => {
        if (
          !puedeGestionar
        ) {
          return;
        }

        const confirmar =
          window.confirm(
            `¿Está seguro de eliminar el ajuste "${ajuste.numeroDocumento}"? El movimiento de inventario será revertido.`
          );

        if (
          !confirmar
        ) {
          return;
        }

        try {
          await api.delete(
            `/ajustes-inventario/${ajuste._id}`
          );

          toast.success(
            "Ajuste eliminado y movimiento revertido correctamente"
          );

          await obtenerAjustes();
        } catch (error) {
          toast.error(
            error.response
              ?.data?.message ||
              "No se pudo eliminar el ajuste"
          );
        }
      };

    const obtenerNombreCategoria =
      (ajuste) => {
        if (
          ajuste.categoriaAjusteId &&
          typeof ajuste.categoriaAjusteId ===
            "object"
        ) {
          return (
            ajuste
              .categoriaAjusteId
              .nombre ||
            "Sin categoría"
          );
        }

        return "Sin categoría";
      };

    const esAjusteDesecho =
      (ajuste) => {
        return (
          ajuste
            ?.categoriaAjusteId
            ?.afectaDesecho ===
          true
        );
      };

    const obtenerNombreProveedor =
      (ajuste) => {
        if (
          ajuste.proveedorId &&
          typeof ajuste.proveedorId ===
            "object"
        ) {
          return (
            ajuste
              .proveedorId
              .nombre ||
            ajuste.proveedor ||
            "Sin proveedor"
          );
        }

        return (
          ajuste.proveedor ||
          "Sin proveedor"
        );
      };

    const obtenerNombreRecurso =
      (detalle) => {
        if (
          detalle?.recursoId &&
          typeof detalle.recursoId ===
            "object"
        ) {
          return (
            detalle.recursoId
              .nombre ||
            "Recurso"
          );
        }

        return "Recurso";
      };

    const obtenerCodigoRecurso =
      (detalle) => {
        if (
          detalle?.recursoId &&
          typeof detalle.recursoId ===
            "object"
        ) {
          return (
            detalle.recursoId
              .codigo ||
            "—"
          );
        }

        return "—";
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

    function normalizarDecimal(
      valor
    ) {
      if (
        valor === null ||
        valor === undefined ||
        valor === ""
      ) {
        return 0;
      }

      if (
        typeof valor ===
        "number"
      ) {
        return valor;
      }

      if (
        typeof valor ===
        "string"
      ) {
        return (
          Number(valor) ||
          0
        );
      }

      if (
        typeof valor ===
          "object" &&
        valor.$numberDecimal !==
          undefined
      ) {
        return (
          Number(
            valor.$numberDecimal
          ) || 0
        );
      }

      return (
        Number(valor) ||
        0
      );
    }

    const formatearMoneda = (
      valor
    ) => {
      return new Intl.NumberFormat(
        "es-SV",
        {
          style: "currency",
          currency: "USD",
        }
      ).format(
        normalizarDecimal(
          valor
        )
      );
    };

    const calcularTotalAjuste =
      (ajuste) => {
        if (
          !Array.isArray(
            ajuste.detalleAjuste
          )
        ) {
          return 0;
        }

        return ajuste.detalleAjuste.reduce(
          (
            total,
            detalle
          ) =>
            total +
            Number(
              detalle.cantidad ||
                0
            ) *
              normalizarDecimal(
                detalle.costoUnitario
              ),
          0
        );
      };

    const totalFormulario =
      useMemo(() => {
        return formulario.detalleAjuste.reduce(
          (
            total,
            detalle
          ) =>
            total +
            Number(
              detalle.cantidad ||
                0
            ) *
              Number(
                detalle.costoUnitario ||
                  0
              ),
          0
        );
      }, [
        formulario.detalleAjuste,
      ]);

    return (
      <section className="module-page">
        <div className="module-header">
          <div className="module-title">
            <ClipboardPlus
              size={30}
            />

            <div>
              <h1>
                Ajustes de
                Inventario
              </h1>

              <p>
                Entradas, salidas
                y bajas de recursos
                del inventario
              </p>
            </div>
          </div>

          <div className="module-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={
                obtenerAjustes
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
                Nuevo ajuste
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
    onSubmit={aplicarFiltros}
  >
    <div className="form-grid">
      <div className="form-group">
        <label>
          Documento
        </label>

        <input
          name="numeroDocumento"
          value={filtros.numeroDocumento}
          onChange={handleFiltroChange}
          placeholder="AJ-001"
        />
      </div>

      <div className="form-group">
        <label>
          Justificación
        </label>

        <input
          name="justificacion"
          value={filtros.justificacion}
          onChange={handleFiltroChange}
          placeholder="Buscar motivo"
        />
      </div>

      <div className="form-group">
        <label>
          Categoría
        </label>

        <SearchableSelect
          endpoint="/categorias-ajustes"
          selectedOption={categoriaFiltro}
          onChange={setCategoriaFiltro}
          placeholder="Buscar categoría..."
          getOptionValue={(categoria) =>
            categoria._id
          }
          getOptionLabel={(categoria) =>
            categoria.nombre
          }
        />
      </div>

              <div className="form-group">
                <label>
                  Proveedor
                </label>

                <SearchableSelect
                  endpoint="/proveedores"
                  selectedOption={
                    proveedorFiltro
                  }
                  onChange={
                    setProveedorFiltro
                  }
                  placeholder="Buscar proveedor..."
                  getOptionValue={(
                    proveedor
                  ) =>
                    proveedor._id
                  }
                  getOptionLabel={(
                    proveedor
                  ) =>
                    proveedor.nombre
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Recurso
                </label>

                <SearchableSelect
                  endpoint="/recursos"
                  selectedOption={
                    recursoFiltro
                  }
                  onChange={
                    setRecursoFiltro
                  }
                  placeholder="Buscar recurso..."
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

              <div className="form-group">
                <label>
                  Movimiento
                </label>

                <select
                  name="tipoMovimiento"
                  value={
                    filtros.tipoMovimiento
                  }
                  onChange={
                    handleFiltroChange
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="entrada">
                    Entrada
                  </option>

                  <option value="salida">
                    Salida
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Desde
                </label>

                <input
                  name="fechaDesde"
                  type="date"
                  value={
                    filtros.fechaDesde
                  }
                  onChange={
                    handleFiltroChange
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Hasta
                </label>

                <input
                  name="fechaHasta"
                  type="date"
                  value={
                    filtros.fechaHasta
                  }
                  onChange={
                    handleFiltroChange
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
              Cargando ajustes...
            </div>
          ) : ajustes.length ===
            0 ? (
            <div className="table-message">
              No hay ajustes para
              mostrar.
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>
                        Documento
                      </th>
                      <th>
                        Fecha
                      </th>
                      <th>
                        Categoría
                      </th>
                      <th>
                        Efecto
                      </th>
                      <th>
                        Proveedor
                      </th>
                      <th>
                        Detalles
                      </th>
                      <th>
                        Total
                      </th>
                      <th>
                        Justificación
                      </th>
                      <th>
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ajustes.map(
                      (
                        ajuste
                      ) => (
                        <tr
                          key={
                            ajuste._id
                          }
                        >
                          <td>
                            <span className="code-badge">
                              {
                                ajuste.numeroDocumento
                              }
                            </span>
                          </td>

                          <td>
                            {formatearFecha(
                              ajuste.fecha
                            )}
                          </td>

                          <td>
                            {obtenerNombreCategoria(
                              ajuste
                            )}
                          </td>

                          <td>
                            {esAjusteDesecho(
                              ajuste
                            ) ? (
                              <span className="status-badge inactive">
                                Desecho
                              </span>
                            ) : (
                              <span className="status-badge active">
                                Normal
                              </span>
                            )}
                          </td>

                          <td>
                            {obtenerNombreProveedor(
                              ajuste
                            )}
                          </td>

                          <td>
                            <span className="assignment-badge">
                              {Array.isArray(
                                ajuste.detalleAjuste
                              )
                                ? ajuste
                                    .detalleAjuste
                                    .length
                                : 0}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {formatearMoneda(
                                calcularTotalAjuste(
                                  ajuste
                                )
                              )}
                            </strong>
                          </td>

                          <td>
                            <span className="adjustment-reason">
                              {ajuste.justificacion ||
                                "—"}
                            </span>
                          </td>

                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="icon-button"
                                title="Ver detalle"
                                onClick={() =>
                                  abrirDetalle(
                                    ajuste
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
                                    className="icon-button"
                                    title="Editar información"
                                    onClick={() =>
                                      abrirEditar(
                                        ajuste
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
                                    title="Eliminar y revertir movimiento"
                                    onClick={() =>
                                      eliminarAjuste(
                                        ajuste
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
              <div className="modal-card adjustment-modal">
                <div className="modal-header">
                  <div>
                    <h2>
                      {ajusteEditando
                        ? "Editar ajuste"
                        : "Nuevo ajuste"}
                    </h2>

                    <p>
                      {ajusteEditando
                        ? "Los movimientos ya aplicados no pueden modificarse. Solo puede editar la información administrativa."
                        : "Registre una entrada, salida o desecho de inventario."}
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
                    guardarAjuste
                  }
                >
                  <div className="form-section">
                    <h3>
                      Información del
                      ajuste
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Número de
                          documento
                        </label>

                        <input
                          name="numeroDocumento"
                          type="text"
                          value={
                            formulario.numeroDocumento
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="AJ-001"
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Fecha
                        </label>

                        <input
                          name="fecha"
                          type="date"
                          value={
                            formulario.fecha
                          }
                          onChange={
                            handleChange
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Categoría
                        </label>

                        {ajusteEditando ? (
                          <input
                            disabled
                            value={
                              categoriaFormulario
                                ?.nombre ||
                              "Categoría del ajuste"
                            }
                          />
                        ) : (
                          <SearchableSelect
                            endpoint="/categorias-ajustes?activo=true"
                            selectedOption={
                              categoriaFormulario
                            }
                            onChange={
                              seleccionarCategoria
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
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Proveedor
                        </label>

                        <SearchableSelect
                          endpoint="/proveedores?activo=true"
                          selectedOption={
                            proveedorFormulario
                          }
                          onChange={
                            seleccionarProveedor
                          }
                          placeholder="Sin proveedor / buscar..."
                          getOptionValue={(
                            proveedor
                          ) =>
                            proveedor._id
                          }
                          getOptionLabel={(
                            proveedor
                          ) =>
                            proveedor.nombre
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Justificación
                      </label>

                      <textarea
                        name="justificacion"
                        rows={3}
                        value={
                          formulario.justificacion
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Motivo del movimiento"
                      />
                    </div>

                    {categoriaEsDesecho &&
                      !ajusteEditando && (
                        <div className="permission-info">
                          Esta categoría
                          representa una
                          baja o desecho.
                          Todos los
                          movimientos serán
                          salidas y
                          aumentarán
                          automáticamente
                          cantidadDesecho sin
                          disminuir
                          existenciaTotal.
                        </div>
                      )}

                    {ajusteEditando && (
                      <div className="permission-info">
                        Los recursos,
                        cantidades, tipos de
                        movimiento y
                        categoría están
                        bloqueados porque el
                        ajuste ya afectó el
                        inventario.
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <div className="detail-section-header">
                      <div>
                        <h3>
                          Detalle del ajuste
                        </h3>

                        <span>
                          {
                            formulario
                              .detalleAjuste
                              .length
                          }{" "}
                          movimiento(s)
                        </span>
                      </div>

                      {!ajusteEditando && (
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={
                            agregarDetalle
                          }
                        >
                          <Plus
                            size={
                              17
                            }
                          />
                          Agregar recurso
                        </button>
                      )}
                    </div>

                    <div className="adjustment-details">
                      {formulario.detalleAjuste.map(
                        (
                          detalle,
                          index
                        ) => {
                          const disponible =
                            calcularDisponible(
                              detalle.recurso
                            );

                          return (
                            <div
                              key={
                                `${index}-${detalle.recursoId}`
                              }
                              className="adjustment-detail-card"
                            >
                              <div className="adjustment-detail-number">
                                <span>
                                  Detalle{" "}
                                  {index +
                                    1}
                                </span>

                                {!ajusteEditando && (
                                  <button
                                    type="button"
                                    className="icon-button danger"
                                    onClick={() =>
                                      eliminarDetalle(
                                        index
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                )}
                              </div>

                              <div className="adjustment-detail-grid">
                                <div className="form-group adjustment-resource-field">
                                  <label>
                                    Recurso
                                  </label>

                                  {ajusteEditando ? (
                                    <input
                                      disabled
                                      value={
                                        detalle
                                          .recurso
                                          ?.nombre ||
                                        "Recurso"
                                      }
                                    />
                                  ) : (
                                    <SearchableSelect
                                      endpoint="/recursos?activo=true"
                                      selectedOption={
                                        detalle.recurso
                                      }
                                      onChange={(
                                        recurso
                                      ) =>
                                        seleccionarRecurso(
                                          index,
                                          recurso
                                        )
                                      }
                                      placeholder="Buscar recurso..."
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
                                  )}

                                  {detalle.recurso && (
                                    <small className="form-help">
                                      Disponible:{" "}
                                      {
                                        disponible
                                      }
                                    </small>
                                  )}
                                </div>

                                <div className="form-group">
                                  <label>
                                    Movimiento
                                  </label>

                                  <select
                                    value={
                                      categoriaEsDesecho
                                        ? "salida"
                                        : detalle.tipoMovimiento
                                    }
                                    disabled={
                                      ajusteEditando ||
                                      categoriaEsDesecho
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleDetalleChange(
                                        index,
                                        "tipoMovimiento",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    <option value="entrada">
                                      Entrada
                                    </option>

                                    <option value="salida">
                                      {categoriaEsDesecho
                                        ? "Salida a desecho"
                                        : "Salida"}
                                    </option>
                                  </select>
                                </div>

                                <div className="form-group">
                                  <label>
                                    Cantidad
                                  </label>

                                  <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    disabled={
                                      ajusteEditando
                                    }
                                    value={
                                      detalle.cantidad
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleDetalleChange(
                                        index,
                                        "cantidad",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  />
                                </div>

                                <div className="form-group">
                                  <label>
                                    Costo unitario
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    disabled={
                                      ajusteEditando
                                    }
                                    value={
                                      detalle.costoUnitario
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleDetalleChange(
                                        index,
                                        "costoUnitario",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              {!ajusteEditando &&
                                detalle.tipoMovimiento ===
                                  "salida" &&
                                detalle.recurso && (
                                  <div className="permission-info">
                                    Disponible
                                    actualmente:{" "}
                                    <strong>
                                      {
                                        disponible
                                      }
                                    </strong>
                                  </div>
                                )}
                            </div>
                          );
                        }
                      )}
                    </div>

                    <div className="adjustment-total">
                      <span>
                        Total estimado
                      </span>

                      <strong>
                        {formatearMoneda(
                          totalFormulario
                        )}
                      </strong>
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
                        : ajusteEditando
                          ? "Guardar información"
                          : categoriaEsDesecho
                            ? "Registrar desecho"
                            : "Registrar ajuste"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        {mostrarDetalle &&
          ajusteVisualizando && (
            <div className="modal-overlay">
              <div className="modal-card adjustment-modal">
                <div className="modal-header">
                  <div>
                    <h2>
                      Detalle del ajuste
                    </h2>

                    <p>
                      {
                        ajusteVisualizando.numeroDocumento
                      }
                    </p>
                  </div>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={
                      cerrarDetalle
                    }
                  >
                    <X
                      size={20}
                    />
                  </button>
                </div>

                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Documento
                      </label>

                      <strong>
                        {
                          ajusteVisualizando.numeroDocumento
                        }
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>
                        Fecha
                      </label>

                      <strong>
                        {formatearFecha(
                          ajusteVisualizando.fecha
                        )}
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>
                        Categoría
                      </label>

                      <strong>
                        {obtenerNombreCategoria(
                          ajusteVisualizando
                        )}
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>
                        Efecto
                      </label>

                      <strong>
                        {esAjusteDesecho(
                          ajusteVisualizando
                        )
                          ? "Desecho / baja"
                          : "Movimiento normal"}
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>
                        Proveedor
                      </label>

                      <strong>
                        {obtenerNombreProveedor(
                          ajusteVisualizando
                        )}
                      </strong>
                    </div>

                    <div className="form-group">
                      <label>
                        Total
                      </label>

                      <strong>
                        {formatearMoneda(
                          calcularTotalAjuste(
                            ajusteVisualizando
                          )
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Justificación
                    </label>

                    <p>
                      {
                        ajusteVisualizando.justificacion
                      }
                    </p>
                  </div>
                </div>

                <div className="form-section">
                  <h3>
                    Movimientos
                  </h3>

                  <div className="adjustment-details">
                    {Array.isArray(
                      ajusteVisualizando.detalleAjuste
                    ) &&
                      ajusteVisualizando.detalleAjuste.map(
                        (
                          detalle,
                          index
                        ) => (
                          <div
                            key={
                              detalle._id ||
                              index
                            }
                            className="adjustment-detail-card"
                          >
                            <div className="adjustment-detail-number">
                              <span>
                                Detalle{" "}
                                {index +
                                  1}
                              </span>

                              {detalle.tipoMovimiento ===
                              "entrada" ? (
                                <ArrowDownToLine
                                  size={
                                    18
                                  }
                                />
                              ) : (
                                <ArrowUpFromLine
                                  size={
                                    18
                                  }
                                />
                              )}
                            </div>

                            <div className="form-grid">
                              <div className="form-group">
                                <label>
                                  Recurso
                                </label>

                                <strong>
                                  {obtenerNombreRecurso(
                                    detalle
                                  )}
                                </strong>

                                <span>
                                  {obtenerCodigoRecurso(
                                    detalle
                                  )}
                                </span>
                              </div>

                              <div className="form-group">
                                <label>
                                  Movimiento
                                </label>

                                <strong>
                                  {esAjusteDesecho(
                                    ajusteVisualizando
                                  )
                                    ? "Salida a desecho"
                                    : detalle.tipoMovimiento ===
                                        "entrada"
                                      ? "Entrada"
                                      : "Salida"}
                                </strong>
                              </div>

                              <div className="form-group">
                                <label>
                                  Cantidad
                                </label>

                                <strong>
                                  {
                                    detalle.cantidad
                                  }
                                </strong>
                              </div>

                              <div className="form-group">
                                <label>
                                  Costo unitario
                                </label>

                                <strong>
                                  {formatearMoneda(
                                    detalle.costoUnitario
                                  )}
                                </strong>
                              </div>

                              <div className="form-group">
                                <label>
                                  Subtotal
                                </label>

                                <strong>
                                  {formatearMoneda(
                                    Number(
                                      detalle.cantidad ||
                                        0
                                    ) *
                                      normalizarDecimal(
                                        detalle.costoUnitario
                                      )
                                  )}
                                </strong>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={
                      cerrarDetalle
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

export default AjustesInventarioPage;