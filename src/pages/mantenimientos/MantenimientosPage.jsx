import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { toast } from "react-hot-toast";

import api from "../../api/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Pagination from "../../components/common/Pagination.jsx";
import SearchableSelect from "../../components/common/SearchableSelect.jsx";

const fechaActual = () =>
  new Date()
    .toISOString()
    .split("T")[0];

const estadoInicialFormulario = {
  recursoId: "",
  cantidad: 1,
  empleadoReportaId: "",
  tecnicoAsignadoId: "",
  proveedorId: "",
  tipo: "incidencia",
  estado: "notificado",
  descripcionProblema: "",
  fechaCreacion: fechaActual(),
  fechaInicio: "",
  fechaFinalizacion: "",
  detallePreventivo: {
    frecuenciaDias: 30,
    proximaFechaProgramada: "",
  },
  detalleCorrectivo: {
    horasTrabajadas: 0,
    costoRepuestos: 0,
    detallesTecnicos: "",
    resolucionTecnica: "",
  },
};

const filtrosIniciales = {
  tipo: "",
  estado: "",
  descripcionProblema: "",
  fechaDesde: "",
  fechaHasta: "",
};

const MantenimientosPage = ({
  modo = "general",
}) => {
  const {
    usuario,
    empleadoId,
  } = useAuth();

  const esMisMantenimientos =
    modo === "mios";

  const puedeGestionar = [
    "administrador",
    "tecnico",
  ].includes(usuario?.rol);

  const puedeEliminar =
    usuario?.rol ===
    "administrador";

  const [
    mantenimientos,
    setMantenimientos,
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
    mantenimientoEditando,
    setMantenimientoEditando,
  ] = useState(null);

  const [
    mantenimientoVisualizando,
    setMantenimientoVisualizando,
  ] = useState(null);

  const [
    formulario,
    setFormulario,
  ] = useState(
    estadoInicialFormulario
  );

  const [
    recursoFormulario,
    setRecursoFormulario,
  ] = useState(null);

  const [
    empleadoFormulario,
    setEmpleadoFormulario,
  ] = useState(null);

  const [
    tecnicoFormulario,
    setTecnicoFormulario,
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
    recursoFiltro,
    setRecursoFiltro,
  ] = useState(null);

  const [
    empleadoFiltro,
    setEmpleadoFiltro,
  ] = useState(null);

  const [
    tecnicoFiltro,
    setTecnicoFiltro,
  ] = useState(null);

  const [
    proveedorFiltro,
    setProveedorFiltro,
  ] = useState(null);

  const [
    recursoFiltroAplicado,
    setRecursoFiltroAplicado,
  ] = useState(null);

  const [
    empleadoFiltroAplicado,
    setEmpleadoFiltroAplicado,
  ] = useState(null);

  const [
    tecnicoFiltroAplicado,
    setTecnicoFiltroAplicado,
  ] = useState(null);

  const [
    proveedorFiltroAplicado,
    setProveedorFiltroAplicado,
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

  const obtenerMantenimientos =
    async () => {
      try {
        setCargando(true);

        if (
          esMisMantenimientos &&
          !empleadoId
        ) {
          setMantenimientos([]);
          setTotalRegistros(0);

          return;
        }

        const params = {
          page: paginaActual,
          limit:
            registrosPorPagina,
        };

        if (
          filtrosAplicados.tipo
        ) {
          params.tipo =
            filtrosAplicados.tipo;
        }

        if (
          filtrosAplicados.estado
        ) {
          params.estado =
            filtrosAplicados.estado;
        }

        if (
          filtrosAplicados
            .descripcionProblema
            .trim()
        ) {
          params.descripcionProblema =
            filtrosAplicados
              .descripcionProblema
              .trim();
        }

        if (
          filtrosAplicados.fechaDesde
        ) {
          params.fechaDesde =
            filtrosAplicados.fechaDesde;
        }

        if (
          filtrosAplicados.fechaHasta
        ) {
          params.fechaHasta =
            filtrosAplicados.fechaHasta;
        }

        if (
          recursoFiltroAplicado?._id
        ) {
          params.recursoId =
            recursoFiltroAplicado._id;
        }

        if (
          empleadoFiltroAplicado?._id
        ) {
          params.empleadoReportaId =
            empleadoFiltroAplicado._id;
        }

        if (
          proveedorFiltroAplicado?._id
        ) {
          params.proveedorId =
            proveedorFiltroAplicado._id;
        }

        if (
          esMisMantenimientos
        ) {
          params.tecnicoAsignadoId =
            empleadoId;
        } else if (
          tecnicoFiltroAplicado?._id
        ) {
          params.tecnicoAsignadoId =
            tecnicoFiltroAplicado._id;
        }

        const response =
          await api.get(
            "/mantenimientos",
            {
              params,
            }
          );

        const data =
          obtenerData(response);

        setMantenimientos(
          data
        );

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
            "No se pudieron obtener los mantenimientos"
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    obtenerMantenimientos();
  }, [
    paginaActual,
    registrosPorPagina,
    filtrosAplicados,
    recursoFiltroAplicado,
    empleadoFiltroAplicado,
    tecnicoFiltroAplicado,
    proveedorFiltroAplicado,
    esMisMantenimientos,
    empleadoId,
  ]);

  const estadisticasPagina =
    useMemo(() => {
      return mantenimientos.reduce(
        (
          acumulador,
          mantenimiento
        ) => {
          acumulador.total += 1;

          if (
            mantenimiento.tipo ===
            "incidencia"
          ) {
            acumulador.incidencias +=
              1;
          }

          if (
            mantenimiento.estado ===
            "notificado"
          ) {
            acumulador.notificados +=
              1;
          }

          if (
            mantenimiento.estado ===
            "en_proceso"
          ) {
            acumulador.enProceso +=
              1;
          }

          if (
            mantenimiento.estado ===
            "corregido"
          ) {
            acumulador.corregidos +=
              1;
          }

          return acumulador;
        },
        {
          total: 0,
          incidencias: 0,
          notificados: 0,
          enProceso: 0,
          corregidos: 0,
        }
      );
    }, [
      mantenimientos,
    ]);

  const convertirFechaInput = (
    fecha
  ) => {
    if (!fecha) {
      return "";
    }

    try {
      return new Date(
        fecha
      )
        .toISOString()
        .split("T")[0];
    } catch {
      return "";
    }
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
      Number(valor || 0)
    );
  };

  const etiquetaTipo = (
    tipo
  ) => {
    const etiquetas = {
      incidencia:
        "Incidencia",
      preventivo:
        "Preventivo",
      correctivo:
        "Correctivo",
    };

    return (
      etiquetas[tipo] ||
      tipo
    );
  };

  const etiquetaEstado = (
    estado
  ) => {
    const etiquetas = {
      notificado:
        "Notificado",
      en_proceso:
        "En proceso",
      corregido:
        "Corregido",
      programado:
        "Programado",
    };

    return (
      etiquetas[estado] ||
      estado
    );
  };

  const nombreEmpleado = (
    empleado
  ) => {
    if (!empleado) {
      return "Sin empleado";
    }

    if (
      typeof empleado !==
      "object"
    ) {
      return "Empleado";
    }

    return `${empleado.nombres || ""} ${
      empleado.apellidos || ""
    }`.trim();
  };

  const obtenerNombreRecurso = (
    mantenimiento
  ) => {
    if (
      mantenimiento.recursoId &&
      typeof mantenimiento.recursoId ===
        "object"
    ) {
      return (
        mantenimiento
          .recursoId
          .nombre ||
        "Sin recurso"
      );
    }

    return "Sin recurso";
  };

  const obtenerCodigoRecurso = (
    mantenimiento
  ) => {
    if (
      mantenimiento.recursoId &&
      typeof mantenimiento.recursoId ===
        "object"
    ) {
      return (
        mantenimiento
          .recursoId
          .codigo ||
        "—"
      );
    }

    return "—";
  };

  const obtenerNombreEmpleadoReporta =
    (mantenimiento) => {
      return nombreEmpleado(
        mantenimiento
          .empleadoReportaId
      );
    };

  const obtenerNombreTecnico =
    (mantenimiento) => {
      if (
        !mantenimiento
          .tecnicoAsignadoId
      ) {
        return "Sin asignar";
      }

      return nombreEmpleado(
        mantenimiento
          .tecnicoAsignadoId
      );
    };

  const obtenerNombreProveedor =
    (mantenimiento) => {
      if (
        mantenimiento.proveedorId &&
        typeof mantenimiento.proveedorId ===
          "object"
      ) {
        return (
          mantenimiento
            .proveedorId
            .nombre ||
          "Sin proveedor"
        );
      }

      return "Sin proveedor";
    };

  const handleFiltroChange = (
    event
  ) => {
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

  const aplicarFiltros = (
    event
  ) => {
    event.preventDefault();

    setPaginaActual(1);

    setFiltrosAplicados({
      ...filtros,
    });

    setRecursoFiltroAplicado(
      recursoFiltro
    );

    setEmpleadoFiltroAplicado(
      empleadoFiltro
    );

    setTecnicoFiltroAplicado(
      tecnicoFiltro
    );

    setProveedorFiltroAplicado(
      proveedorFiltro
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

      setRecursoFiltro(null);
      setEmpleadoFiltro(null);
      setTecnicoFiltro(null);
      setProveedorFiltro(null);

      setRecursoFiltroAplicado(
        null
      );

      setEmpleadoFiltroAplicado(
        null
      );

      setTecnicoFiltroAplicado(
        null
      );

      setProveedorFiltroAplicado(
        null
      );

      setPaginaActual(1);
    };

  const seleccionarRecursoFormulario =
    (recurso) => {
      setRecursoFormulario(
        recurso || null
      );

      setFormulario(
        (prev) => ({
          ...prev,
          recursoId:
            recurso?._id ||
            "",
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
          empleadoReportaId:
            empleado?._id ||
            "",
        })
      );
    };

  const seleccionarProveedorFormulario =
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

  const seleccionarTecnicoFormulario =
    (tecnico) => {
      setTecnicoFormulario(
        tecnico || null
      );

      setFormulario(
        (prev) => {
          const tecnicoId =
            tecnico?._id ||
            "";

          let estado =
            prev.estado;

          if (
            tecnicoId &&
            prev.estado ===
              "notificado"
          ) {
            estado =
              "en_proceso";
          }

          if (
            !tecnicoId &&
            prev.estado ===
              "en_proceso"
          ) {
            estado =
              "notificado";
          }

          return {
            ...prev,
            tecnicoAsignadoId:
              tecnicoId,
            estado,
          };
        }
      );
    };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    if (
      name === "cantidad"
    ) {
      setFormulario(
        (prev) => ({
          ...prev,
          cantidad:
            value === ""
              ? ""
              : Number(value),
        })
      );

      return;
    }

    if (
      name === "tipo"
    ) {
      setFormulario(
        (prev) => ({
          ...prev,
          tipo: value,
          estado:
            value ===
              "preventivo" &&
            prev.estado ===
              "notificado"
              ? "programado"
              : value ===
                    "incidencia" &&
                  prev.estado ===
                    "programado"
                ? "notificado"
                : prev.estado,
          detallePreventivo:
            value ===
            "preventivo"
              ? prev.detallePreventivo
              : {
                  frecuenciaDias:
                    30,
                  proximaFechaProgramada:
                    "",
                },
          detalleCorrectivo:
            value ===
            "correctivo"
              ? prev.detalleCorrectivo
              : {
                  horasTrabajadas:
                    0,
                  costoRepuestos:
                    0,
                  detallesTecnicos:
                    "",
                  resolucionTecnica:
                    "",
                },
        })
      );

      return;
    }

    if (
      name === "estado"
    ) {
      if (
        value ===
          "en_proceso" &&
        !formulario
          .tecnicoAsignadoId
      ) {
        toast.error(
          "Debe asignar un técnico antes de poner el mantenimiento en proceso"
        );

        return;
      }

      setFormulario(
        (prev) => ({
          ...prev,
          estado: value,
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

  const handlePreventivoChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormulario(
        (prev) => ({
          ...prev,
          detallePreventivo: {
            ...prev.detallePreventivo,
            [name]:
              name ===
              "frecuenciaDias"
                ? value ===
                  ""
                  ? ""
                  : Number(
                      value
                    )
                : value,
          },
        })
      );
    };

  const handleCorrectivoChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormulario(
        (prev) => ({
          ...prev,
          detalleCorrectivo: {
            ...prev.detalleCorrectivo,
            [name]: [
              "horasTrabajadas",
              "costoRepuestos",
            ].includes(
              name
            )
              ? value === ""
                ? ""
                : Number(
                    value
                  )
              : value,
          },
        })
      );
    };

  const limpiarSelectsFormulario =
    () => {
      setRecursoFormulario(
        null
      );

      setEmpleadoFormulario(
        null
      );

      setTecnicoFormulario(
        null
      );

      setProveedorFormulario(
        null
      );
    };

  const abrirCrear = () => {
    setMantenimientoEditando(
      null
    );

    limpiarSelectsFormulario();

    setFormulario({
      ...estadoInicialFormulario,
      fechaCreacion:
        fechaActual(),
      detallePreventivo: {
        frecuenciaDias: 30,
        proximaFechaProgramada:
          "",
      },
      detalleCorrectivo: {
        horasTrabajadas: 0,
        costoRepuestos: 0,
        detallesTecnicos: "",
        resolucionTecnica: "",
      },
    });

    setMostrarFormulario(
      true
    );
  };

  const abrirEditar = (
    mantenimiento
  ) => {
    setMantenimientoEditando(
      mantenimiento
    );

    const recurso =
      mantenimiento.recursoId &&
      typeof mantenimiento.recursoId ===
        "object"
        ? mantenimiento.recursoId
        : null;

    const empleado =
      mantenimiento.empleadoReportaId &&
      typeof mantenimiento.empleadoReportaId ===
        "object"
        ? mantenimiento
            .empleadoReportaId
        : null;

    const tecnico =
      mantenimiento.tecnicoAsignadoId &&
      typeof mantenimiento.tecnicoAsignadoId ===
        "object"
        ? mantenimiento
            .tecnicoAsignadoId
        : null;

    const proveedor =
      mantenimiento.proveedorId &&
      typeof mantenimiento.proveedorId ===
        "object"
        ? mantenimiento.proveedorId
        : null;

    setRecursoFormulario(
      recurso
    );

    setEmpleadoFormulario(
      empleado
    );

    setTecnicoFormulario(
      tecnico
    );

    setProveedorFormulario(
      proveedor
    );

    setFormulario({
      recursoId:
        recurso?._id ||
        mantenimiento.recursoId ||
        "",
      cantidad:
        mantenimiento.cantidad ??
        1,
      empleadoReportaId:
        empleado?._id ||
        mantenimiento.empleadoReportaId ||
        "",
      tecnicoAsignadoId:
        tecnico?._id ||
        mantenimiento.tecnicoAsignadoId ||
        "",
      proveedorId:
        proveedor?._id ||
        mantenimiento.proveedorId ||
        "",
      tipo:
        mantenimiento.tipo ||
        "incidencia",
      estado:
        mantenimiento.estado ||
        "notificado",
      descripcionProblema:
        mantenimiento
          .descripcionProblema ||
        "",
      fechaCreacion:
        convertirFechaInput(
          mantenimiento.fechaCreacion
        ),
      fechaInicio:
        convertirFechaInput(
          mantenimiento.fechaInicio
        ),
      fechaFinalizacion:
        convertirFechaInput(
          mantenimiento.fechaFinalizacion
        ),
      detallePreventivo: {
        frecuenciaDias:
          mantenimiento
            .detallePreventivo
            ?.frecuenciaDias ??
          30,
        proximaFechaProgramada:
          convertirFechaInput(
            mantenimiento
              .detallePreventivo
              ?.proximaFechaProgramada
          ),
      },
      detalleCorrectivo: {
        horasTrabajadas:
          mantenimiento
            .detalleCorrectivo
            ?.horasTrabajadas ??
          0,
        costoRepuestos:
          mantenimiento
            .detalleCorrectivo
            ?.costoRepuestos ??
          0,
        detallesTecnicos:
          mantenimiento
            .detalleCorrectivo
            ?.detallesTecnicos ||
          "",
        resolucionTecnica:
          mantenimiento
            .detalleCorrectivo
            ?.resolucionTecnica ||
          "",
      },
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

      setMantenimientoEditando(
        null
      );

      limpiarSelectsFormulario();

      setFormulario({
        ...estadoInicialFormulario,
        fechaCreacion:
          fechaActual(),
        detallePreventivo: {
          frecuenciaDias: 30,
          proximaFechaProgramada:
            "",
        },
        detalleCorrectivo: {
          horasTrabajadas: 0,
          costoRepuestos: 0,
          detallesTecnicos: "",
          resolucionTecnica: "",
        },
      });
    };

  const abrirDetalle = (
    mantenimiento
  ) => {
    setMantenimientoVisualizando(
      mantenimiento
    );

    setMostrarDetalle(
      true
    );
  };

  const cerrarDetalle = () => {
    setMantenimientoVisualizando(
      null
    );

    setMostrarDetalle(
      false
    );
  };

  const validarFormulario =
    () => {
      if (
        !formulario.recursoId
      ) {
        toast.error(
          "Debe seleccionar un recurso"
        );

        return false;
      }

      if (
        !formulario
          .empleadoReportaId
      ) {
        toast.error(
          "Debe seleccionar el empleado que reporta"
        );

        return false;
      }

      const cantidad =
        Number(
          formulario.cantidad
        );

      if (
        !Number.isInteger(
          cantidad
        ) ||
        cantidad <= 0
      ) {
        toast.error(
          "La cantidad afectada debe ser un número entero mayor que cero"
        );

        return false;
      }

      if (
        ![
          "incidencia",
          "preventivo",
          "correctivo",
        ].includes(
          formulario.tipo
        )
      ) {
        toast.error(
          "Seleccione un tipo válido"
        );

        return false;
      }

      if (
        ![
          "notificado",
          "en_proceso",
          "corregido",
          "programado",
        ].includes(
          formulario.estado
        )
      ) {
        toast.error(
          "Seleccione un estado válido"
        );

        return false;
      }

      if (
        formulario.estado ===
          "en_proceso" &&
        !formulario
          .tecnicoAsignadoId
      ) {
        toast.error(
          "Debe asignar un técnico antes de iniciar el mantenimiento"
        );

        return false;
      }

      if (
        !formulario
          .descripcionProblema
          .trim()
      ) {
        toast.error(
          formulario.tipo ===
            "incidencia"
            ? "Describa la incidencia encontrada"
            : "La descripción del mantenimiento es obligatoria"
        );

        return false;
      }

      if (
        formulario
          .descripcionProblema
          .trim().length < 5
      ) {
        toast.error(
          "La descripción debe tener al menos 5 caracteres"
        );

        return false;
      }

      if (
        formulario.tipo ===
        "preventivo"
      ) {
        const frecuencia =
          Number(
            formulario
              .detallePreventivo
              .frecuenciaDias
          );

        if (
          !Number.isInteger(
            frecuencia
          ) ||
          frecuencia <= 0
        ) {
          toast.error(
            "La frecuencia debe ser un número entero mayor que cero"
          );

          return false;
        }

        if (
          !formulario
            .detallePreventivo
            .proximaFechaProgramada
        ) {
          toast.error(
            "Ingrese la próxima fecha programada"
          );

          return false;
        }
      }

      if (
        formulario.tipo ===
        "correctivo"
      ) {
        if (
          Number(
            formulario
              .detalleCorrectivo
              .horasTrabajadas
          ) < 0
        ) {
          toast.error(
            "Las horas trabajadas no pueden ser negativas"
          );

          return false;
        }

        if (
          Number(
            formulario
              .detalleCorrectivo
              .costoRepuestos
          ) < 0
        ) {
          toast.error(
            "El costo de repuestos no puede ser negativo"
          );

          return false;
        }

        if (
          !formulario
            .detalleCorrectivo
            .detallesTecnicos
            .trim()
        ) {
          toast.error(
            "Ingrese los detalles técnicos"
          );

          return false;
        }

        if (
          !formulario
            .detalleCorrectivo
            .resolucionTecnica
            .trim()
        ) {
          toast.error(
            "Ingrese la resolución técnica"
          );

          return false;
        }
      }

      return true;
    };

  const construirPayload =
    () => {
      const payload = {
        recursoId:
          formulario.recursoId,
        cantidad:
          Number(
            formulario.cantidad
          ),
        empleadoReportaId:
          formulario
            .empleadoReportaId,
        tecnicoAsignadoId:
          formulario
            .tecnicoAsignadoId ||
          null,
        proveedorId:
          formulario.proveedorId ||
          null,
        tipo:
          formulario.tipo,
        estado:
          formulario.estado,
        descripcionProblema:
          formulario
            .descripcionProblema
            .trim(),
        fechaCreacion:
          formulario.fechaCreacion ||
          null,
        fechaInicio:
          formulario.fechaInicio ||
          null,
        fechaFinalizacion:
          formulario
            .fechaFinalizacion ||
          null,
      };

      if (
        formulario.tipo ===
        "preventivo"
      ) {
        payload.detallePreventivo =
          {
            frecuenciaDias:
              Number(
                formulario
                  .detallePreventivo
                  .frecuenciaDias
              ),
            proximaFechaProgramada:
              formulario
                .detallePreventivo
                .proximaFechaProgramada,
          };
      }

      if (
        formulario.tipo ===
        "correctivo"
      ) {
        payload.detalleCorrectivo =
          {
            horasTrabajadas:
              Number(
                formulario
                  .detalleCorrectivo
                  .horasTrabajadas
              ),
            costoRepuestos:
              Number(
                formulario
                  .detalleCorrectivo
                  .costoRepuestos
              ),
            detallesTecnicos:
              formulario
                .detalleCorrectivo
                .detallesTecnicos
                .trim(),
            resolucionTecnica:
              formulario
                .detalleCorrectivo
                .resolucionTecnica
                .trim(),
          };
      }

      return payload;
    };

  const guardarMantenimiento =
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

        const payload =
          construirPayload();

        if (
          mantenimientoEditando
        ) {
          await api.put(
            `/mantenimientos/${mantenimientoEditando._id}`,
            payload
          );

          toast.success(
            "Mantenimiento actualizado correctamente"
          );
        } else {
          await api.post(
            "/mantenimientos",
            payload
          );

          toast.success(
            formulario.tipo ===
              "incidencia"
              ? "Incidencia registrada correctamente"
              : "Mantenimiento registrado correctamente"
          );
        }

        cerrarFormulario();

        await obtenerMantenimientos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo guardar el mantenimiento"
        );
      } finally {
        setGuardando(false);
      }
    };

  const eliminarMantenimiento =
    async (mantenimiento) => {
      if (!puedeEliminar) {
        toast.error(
          "Solo el administrador puede eliminar mantenimientos"
        );

        return;
      }

      const confirmar =
        window.confirm(
          "¿Está seguro de eliminar este mantenimiento?"
        );

      if (!confirmar) {
        return;
      }

      try {
        await api.delete(
          `/mantenimientos/${mantenimiento._id}`
        );

        toast.success(
          "Mantenimiento eliminado correctamente"
        );

        await obtenerMantenimientos();
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "No se pudo eliminar el mantenimiento"
        );
      }
    };

  const tituloPagina =
    esMisMantenimientos
      ? "Mis mantenimientos"
      : "Mantenimientos";

  const descripcionPagina =
    esMisMantenimientos
      ? "Incidencias y trabajos de mantenimiento asignados a su usuario técnico"
      : "Gestión de incidencias, mantenimientos preventivos y correctivos";

  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          <Wrench
            size={30}
          />

          <div>
            <h1>
              {tituloPagina}
            </h1>

            <p>
              {descripcionPagina}
            </p>
          </div>
        </div>

        <div className="module-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={
              obtenerMantenimientos
            }
          >
            <RefreshCw
              size={18}
            />
            Actualizar
          </button>

          {puedeGestionar &&
            !esMisMantenimientos && (
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
                Registrar
                incidencia
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

      {esMisMantenimientos &&
        !empleadoId && (
          <div className="permission-info">
            Su cuenta técnica no
            tiene un empleado
            vinculado.
          </div>
        )}

      <div className="maintenance-summary-grid">
        <div className="maintenance-summary-item notified">
          <AlertTriangle
            size={20}
          />

          <strong>
            {
              estadisticasPagina.incidencias
            }
          </strong>

          <span>
            Incidencias
          </span>
        </div>

        <div className="maintenance-summary-item notified">
          <Clock3
            size={20}
          />

          <strong>
            {
              estadisticasPagina.notificados
            }
          </strong>

          <span>
            Notificados
          </span>
        </div>

        <div className="maintenance-summary-item processing">
          <Wrench
            size={20}
          />

          <strong>
            {
              estadisticasPagina.enProceso
            }
          </strong>

          <span>
            En proceso
          </span>
        </div>

        <div className="maintenance-summary-item fixed">
          <CheckCircle2
            size={20}
          />

          <strong>
            {
              estadisticasPagina.corregidos
            }
          </strong>

          <span>
            Corregidos
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
                Tipo
              </label>

              <select
                name="tipo"
                value={
                  filtros.tipo
                }
                onChange={
                  handleFiltroChange
                }
              >
                <option value="">
                  Todos
                </option>

                <option value="incidencia">
                  Incidencias
                </option>

                <option value="preventivo">
                  Preventivos
                </option>

                <option value="correctivo">
                  Correctivos
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Estado
              </label>

              <select
                name="estado"
                value={
                  filtros.estado
                }
                onChange={
                  handleFiltroChange
                }
              >
                <option value="">
                  Todos
                </option>

                <option value="notificado">
                  Notificado
                </option>

                <option value="programado">
                  Programado
                </option>

                <option value="en_proceso">
                  En proceso
                </option>

                <option value="corregido">
                  Corregido
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Problema /
                incidencia
              </label>

              <input
                name="descripcionProblema"
                value={
                  filtros.descripcionProblema
                }
                onChange={
                  handleFiltroChange
                }
                placeholder="Ej. no enciende"
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

            {!esMisMantenimientos && (
              <div className="form-group">
                <label>
                  Técnico
                </label>

                <SearchableSelect
                  endpoint="/empleados"
                        extraParams={{
                          soloTecnicos: true,
                          activo: true,
                        }}
                        minChars={0}
                        limit={20}
                  selectedOption={
                    tecnicoFiltro
                  }
                  onChange={
                    setTecnicoFiltro
                  }
                  placeholder="Buscar técnico..."
                  getOptionValue={(
                    empleado
                  ) =>
                    empleado._id
                  }
                  getOptionLabel={(
                    empleado
                  ) =>
                    `${empleado.nombres} ${empleado.apellidos}`
                  }
                />
              </div>
            )}

            <div className="form-group">
              <label>
                Reportado por
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
                  `${empleado.nombres} ${empleado.apellidos}`
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
            Cargando mantenimientos...
          </div>
        ) : mantenimientos.length ===
          0 ? (
          <div className="table-message">
            {esMisMantenimientos
              ? "No tiene mantenimientos asignados."
              : "No hay mantenimientos que coincidan con los filtros."}
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
                      Cantidad
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Estado
                    </th>

                    <th>
                      Incidencia /
                      problema
                    </th>

                    <th>
                      Reportado por
                    </th>

                    <th>
                      Técnico
                    </th>

                    <th>
                      Fecha
                    </th>

                    <th>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {mantenimientos.map(
                    (
                      mantenimiento
                    ) => (
                      <tr
                        key={
                          mantenimiento._id
                        }
                      >
                        <td>
                          <div className="maintenance-resource">
                            <div className="maintenance-resource-icon">
                              <Wrench
                                size={
                                  17
                                }
                              />
                            </div>

                            <div>
                              <strong>
                                {obtenerNombreRecurso(
                                  mantenimiento
                                )}
                              </strong>

                              <span>
                                {obtenerCodigoRecurso(
                                  mantenimiento
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="code-badge">
                            {mantenimiento.cantidad ||
                              1}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`maintenance-type ${mantenimiento.tipo}`}
                          >
                            {etiquetaTipo(
                              mantenimiento.tipo
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`maintenance-status ${mantenimiento.estado}`}
                          >
                            {etiquetaEstado(
                              mantenimiento.estado
                            )}
                          </span>
                        </td>

                        <td>
                          <span className="maintenance-description">
                            {
                              mantenimiento.descripcionProblema
                            }
                          </span>
                        </td>

                        <td>
                          {obtenerNombreEmpleadoReporta(
                            mantenimiento
                          )}
                        </td>

                        <td>
                          {obtenerNombreTecnico(
                            mantenimiento
                          )}
                        </td>

                        <td>
                          <div className="maintenance-date">
                            <CalendarDays
                              size={
                                14
                              }
                            />

                            {formatearFecha(
                              mantenimiento.fechaCreacion
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="icon-button"
                              title="Ver detalle"
                              onClick={() =>
                                abrirDetalle(
                                  mantenimiento
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
                              <button
                                type="button"
                                className="icon-button"
                                title="Editar"
                                onClick={() =>
                                  abrirEditar(
                                    mantenimiento
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    17
                                  }
                                />
                              </button>
                            )}

                            {puedeEliminar && (
                              <button
                                type="button"
                                className="icon-button danger"
                                title="Eliminar"
                                onClick={() =>
                                  eliminarMantenimiento(
                                    mantenimiento
                                  )
                                }
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>
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
            <div className="modal-card maintenance-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {mantenimientoEditando
                      ? "Editar mantenimiento"
                      : "Registrar incidencia o mantenimiento"}
                  </h2>

                  <p>
                    Registre el
                    problema encontrado
                    y su seguimiento.
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
                  guardarMantenimiento
                }
              >
                <div className="form-section">
                  <h3>
                    Incidencia y recurso
                  </h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Recurso
                      </label>

                      <SearchableSelect
                        endpoint="/recursos"
                        selectedOption={
                          recursoFormulario
                        }
                        onChange={
                          seleccionarRecursoFormulario
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
                        Cantidad afectada
                      </label>

                      <input
                        name="cantidad"
                        type="number"
                        min="1"
                        step="1"
                        value={
                          formulario.cantidad
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Empleado que
                        reporta
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
                          `${empleado.nombres} ${empleado.apellidos}`
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Tipo
                      </label>

                      <select
                        name="tipo"
                        value={
                          formulario.tipo
                        }
                        onChange={
                          handleChange
                        }
                      >
                        <option value="incidencia">
                          Incidencia
                        </option>

                        <option value="preventivo">
                          Preventivo
                        </option>

                        <option value="correctivo">
                          Correctivo
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      {formulario.tipo ===
                      "incidencia"
                        ? "Incidencia encontrada"
                        : "Descripción del problema"}
                    </label>

                    <textarea
                      name="descripcionProblema"
                      rows={4}
                      value={
                        formulario.descripcionProblema
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        formulario.tipo ===
                        "incidencia"
                          ? "Describa qué falla se encontró, síntomas observados y condiciones del recurso..."
                          : "Describa el trabajo o problema..."
                      }
                    />
                  </div>

                  {formulario.tipo ===
                    "incidencia" && (
                    <div className="permission-info">
                      Una incidencia
                      nueva puede quedar
                      como Notificada y
                      sin técnico. Al
                      asignar un técnico,
                      pasa a En proceso y
                      las unidades
                      afectadas cuentan
                      automáticamente como
                      reparación.
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>
                    Atención técnica
                  </h3>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Técnico asignado
                      </label>

                      <SearchableSelect
                        endpoint="/empleados"
                        extraParams={{
                          soloTecnicos: true,
                          activo: true,
                        }}
                        minChars={0}
                        limit={20}
                        selectedOption={
                          tecnicoFormulario
                        }
                        onChange={
                          seleccionarTecnicoFormulario
                        }
                        placeholder="Buscar técnico..."
                        getOptionValue={(
                          tecnico
                        ) =>
                          tecnico._id
                        }
                        getOptionLabel={(
                          tecnico
                        ) =>
                          `${tecnico.nombres} ${tecnico.apellidos}`
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Estado
                      </label>

                      <select
                        name="estado"
                        value={
                          formulario.estado
                        }
                        onChange={
                          handleChange
                        }
                      >
                        <option value="notificado">
                          Notificado
                        </option>

                        <option value="programado">
                          Programado
                        </option>

                        <option value="en_proceso">
                          En proceso
                        </option>

                        <option value="corregido">
                          Corregido
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        Proveedor
                      </label>

                      <SearchableSelect
                        endpoint="/proveedores"
                        selectedOption={
                          proveedorFormulario
                        }
                        onChange={
                          seleccionarProveedorFormulario
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

                    <div className="form-group">
                      <label>
                        Fecha de creación
                      </label>

                      <input
                        name="fechaCreacion"
                        type="date"
                        value={
                          formulario.fechaCreacion
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Fecha de inicio
                      </label>

                      <input
                        name="fechaInicio"
                        type="date"
                        value={
                          formulario.fechaInicio
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Fecha de finalización
                      </label>

                      <input
                        name="fechaFinalizacion"
                        type="date"
                        value={
                          formulario.fechaFinalizacion
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>
                  </div>
                </div>

                {formulario.tipo ===
                  "preventivo" && (
                  <div className="form-section">
                    <h3>
                      Mantenimiento
                      preventivo
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Frecuencia en
                          días
                        </label>

                        <input
                          name="frecuenciaDias"
                          type="number"
                          min="1"
                          step="1"
                          value={
                            formulario
                              .detallePreventivo
                              .frecuenciaDias
                          }
                          onChange={
                            handlePreventivoChange
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Próxima fecha
                          programada
                        </label>

                        <input
                          name="proximaFechaProgramada"
                          type="date"
                          value={
                            formulario
                              .detallePreventivo
                              .proximaFechaProgramada
                          }
                          onChange={
                            handlePreventivoChange
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formulario.tipo ===
                  "correctivo" && (
                  <div className="form-section">
                    <h3>
                      Trabajo correctivo
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Horas trabajadas
                        </label>

                        <input
                          name="horasTrabajadas"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            formulario
                              .detalleCorrectivo
                              .horasTrabajadas
                          }
                          onChange={
                            handleCorrectivoChange
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Costo de
                          repuestos
                        </label>

                        <input
                          name="costoRepuestos"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            formulario
                              .detalleCorrectivo
                              .costoRepuestos
                          }
                          onChange={
                            handleCorrectivoChange
                          }
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Detalles técnicos
                      </label>

                      <textarea
                        name="detallesTecnicos"
                        rows={3}
                        value={
                          formulario
                            .detalleCorrectivo
                            .detallesTecnicos
                        }
                        onChange={
                          handleCorrectivoChange
                        }
                        placeholder="Diagnóstico y trabajo realizado"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Resolución técnica
                      </label>

                      <textarea
                        name="resolucionTecnica"
                        rows={3}
                        value={
                          formulario
                            .detalleCorrectivo
                            .resolucionTecnica
                        }
                        onChange={
                          handleCorrectivoChange
                        }
                        placeholder="Resultado final de la intervención"
                      />
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
                      : mantenimientoEditando
                        ? "Guardar cambios"
                        : formulario.tipo ===
                            "incidencia"
                          ? "Registrar incidencia"
                          : "Registrar mantenimiento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {mostrarDetalle &&
        mantenimientoVisualizando && (
          <div className="modal-overlay">
            <div className="modal-card maintenance-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    Detalle del
                    mantenimiento
                  </h2>

                  <p>
                    Seguimiento completo
                    de la incidencia.
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
                      Recurso
                    </label>

                    <strong>
                      {obtenerNombreRecurso(
                        mantenimientoVisualizando
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Código
                    </label>

                    <strong>
                      {obtenerCodigoRecurso(
                        mantenimientoVisualizando
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Cantidad afectada
                    </label>

                    <strong>
                      {mantenimientoVisualizando.cantidad ||
                        1}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Tipo
                    </label>

                    <span
                      className={`maintenance-type ${mantenimientoVisualizando.tipo}`}
                    >
                      {etiquetaTipo(
                        mantenimientoVisualizando.tipo
                      )}
                    </span>
                  </div>

                  <div className="form-group">
                    <label>
                      Estado
                    </label>

                    <span
                      className={`maintenance-status ${mantenimientoVisualizando.estado}`}
                    >
                      {etiquetaEstado(
                        mantenimientoVisualizando.estado
                      )}
                    </span>
                  </div>

                  <div className="form-group">
                    <label>
                      Reportado por
                    </label>

                    <strong>
                      {obtenerNombreEmpleadoReporta(
                        mantenimientoVisualizando
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Técnico
                    </label>

                    <strong>
                      {obtenerNombreTecnico(
                        mantenimientoVisualizando
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Proveedor
                    </label>

                    <strong>
                      {obtenerNombreProveedor(
                        mantenimientoVisualizando
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Creación
                    </label>

                    <strong>
                      {formatearFecha(
                        mantenimientoVisualizando.fechaCreacion
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Inicio
                    </label>

                    <strong>
                      {formatearFecha(
                        mantenimientoVisualizando.fechaInicio
                      )}
                    </strong>
                  </div>

                  <div className="form-group">
                    <label>
                      Finalización
                    </label>

                    <strong>
                      {formatearFecha(
                        mantenimientoVisualizando.fechaFinalizacion
                      )}
                    </strong>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    {mantenimientoVisualizando.tipo ===
                    "incidencia"
                      ? "Incidencia encontrada"
                      : "Descripción del problema"}
                  </label>

                  <p>
                    {
                      mantenimientoVisualizando.descripcionProblema
                    }
                  </p>
                </div>
              </div>

              {mantenimientoVisualizando.tipo ===
                "preventivo" &&
                mantenimientoVisualizando.detallePreventivo && (
                  <div className="form-section">
                    <h3>
                      Información
                      preventiva
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Frecuencia
                        </label>

                        <strong>
                          {
                            mantenimientoVisualizando
                              .detallePreventivo
                              .frecuenciaDias
                          }{" "}
                          días
                        </strong>
                      </div>

                      <div className="form-group">
                        <label>
                          Próxima fecha
                        </label>

                        <strong>
                          {formatearFecha(
                            mantenimientoVisualizando
                              .detallePreventivo
                              .proximaFechaProgramada
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

              {mantenimientoVisualizando.tipo ===
                "correctivo" &&
                mantenimientoVisualizando.detalleCorrectivo && (
                  <div className="form-section">
                    <h3>
                      Información
                      correctiva
                    </h3>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>
                          Horas trabajadas
                        </label>

                        <strong>
                          {
                            mantenimientoVisualizando
                              .detalleCorrectivo
                              .horasTrabajadas
                          }
                        </strong>
                      </div>

                      <div className="form-group">
                        <label>
                          Costo de
                          repuestos
                        </label>

                        <strong>
                          {formatearMoneda(
                            mantenimientoVisualizando
                              .detalleCorrectivo
                              .costoRepuestos
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        Detalles técnicos
                      </label>

                      <p>
                        {
                          mantenimientoVisualizando
                            .detalleCorrectivo
                            .detallesTecnicos
                        }
                      </p>
                    </div>

                    <div className="form-group">
                      <label>
                        Resolución técnica
                      </label>

                      <p>
                        {
                          mantenimientoVisualizando
                            .detalleCorrectivo
                            .resolucionTecnica
                        }
                      </p>
                    </div>
                  </div>
                )}

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

                {puedeGestionar && (
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() => {
                      const registro =
                        mantenimientoVisualizando;

                      cerrarDetalle();

                      abrirEditar(
                        registro
                      );
                    }}
                  >
                    <Pencil
                      size={17}
                    />
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
    </section>
  );
};

export default MantenimientosPage;