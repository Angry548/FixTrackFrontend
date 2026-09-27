import {
  ChevronDown,
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../../api/api.js";

const SearchableSelect = ({
  value = "",
  onChange,
  endpoint,
  placeholder = "Buscar...",
  emptyMessage = "No se encontraron coincidencias",
  searchParam = "search",
  limitParam = "limit",
  limit = 10,
  minChars = 2,
  debounceMs = 350,
  getOptionValue = (item) =>
    item?._id ?? "",
  getOptionLabel = (item) =>
    item?.nombre ?? "",
  getOptionDescription = null,
  selectedOption = null,
  disabled = false,
  required = false,
  extraParams = {},
}) => {
  const contenedorRef =
    useRef(null);

  const temporizadorRef =
    useRef(null);

  const solicitudRef =
    useRef(0);

  const [
    abierto,
    setAbierto,
  ] = useState(false);

  const [
    busqueda,
    setBusqueda,
  ] = useState("");

  const [
    resultados,
    setResultados,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    opcionSeleccionada,
    setOpcionSeleccionada,
  ] = useState(
    selectedOption || null
  );

  useEffect(() => {
    setOpcionSeleccionada(
      selectedOption || null
    );
  }, [selectedOption]);

  useEffect(() => {
    const cerrarAlHacerClickAfuera = (
      event
    ) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(
          event.target
        )
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickAfuera
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickAfuera
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        temporizadorRef.current
      ) {
        clearTimeout(
          temporizadorRef.current
        );
      }
    };
  }, []);

  const realizarBusqueda =
    async (texto) => {
      const textoLimpio =
        texto.trim();

      if (
        textoLimpio.length <
        minChars
      ) {
        setResultados([]);
        setCargando(false);
        setError("");

        return;
      }

      const numeroSolicitud =
        solicitudRef.current + 1;

      solicitudRef.current =
        numeroSolicitud;

      try {
        setCargando(true);
        setError("");

        const response =
          await api.get(
            endpoint,
            {
              params: {
                ...extraParams,
                [searchParam]:
                  textoLimpio,
                [limitParam]:
                  limit,
              },
            }
          );

        if (
          numeroSolicitud !==
          solicitudRef.current
        ) {
          return;
        }

        const data =
          response.data?.data ??
          response.data ??
          [];

        setResultados(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (errorBusqueda) {
        if (
          numeroSolicitud !==
          solicitudRef.current
        ) {
          return;
        }

        setResultados([]);

        setError(
          errorBusqueda.response
            ?.data?.message ||
            "No se pudieron obtener las coincidencias"
        );
      } finally {
        if (
          numeroSolicitud ===
          solicitudRef.current
        ) {
          setCargando(false);
        }
      }
    };

  const handleBusqueda = (
    event
  ) => {
    const texto =
      event.target.value;

    setBusqueda(texto);
    setAbierto(true);
    setError("");

    if (
      temporizadorRef.current
    ) {
      clearTimeout(
        temporizadorRef.current
      );
    }

    if (
      texto.trim().length <
      minChars
    ) {
      setResultados([]);
      setCargando(false);

      return;
    }

    setCargando(true);

    temporizadorRef.current =
      setTimeout(() => {
        realizarBusqueda(
          texto
        );
      }, debounceMs);
  };

  const seleccionarOpcion = (
    item
  ) => {
    setOpcionSeleccionada(
      item
    );

    setBusqueda("");
    setResultados([]);
    setAbierto(false);
    setError("");

    onChange?.(item);
  };

  const limpiarSeleccion = (
    event
  ) => {
    event.stopPropagation();

    setOpcionSeleccionada(
      null
    );

    setBusqueda("");
    setResultados([]);
    setError("");

    onChange?.(null);

    if (!disabled) {
      setAbierto(true);
    }
  };

  const abrirSelector = () => {
    if (disabled) {
      return;
    }

    setAbierto(true);
  };

  const etiquetaSeleccionada =
    opcionSeleccionada
      ? getOptionLabel(
          opcionSeleccionada
        )
      : "";

  const valorSeleccionado =
    opcionSeleccionada
      ? getOptionValue(
          opcionSeleccionada
        )
      : value || "";

  return (
    <div
      ref={contenedorRef}
      className="searchable-select"
    >
      {opcionSeleccionada ? (
        <div
          className={`searchable-select-control ${
            disabled
              ? "disabled"
              : ""
          }`}
          onClick={
            abrirSelector
          }
        >
          <div className="searchable-select-selected">
            <span>
              {
                etiquetaSeleccionada
              }
            </span>
          </div>

          <div className="searchable-select-actions">
            {!disabled && (
              <button
                type="button"
                className="searchable-select-clear"
                onClick={
                  limpiarSeleccion
                }
                title="Limpiar selección"
              >
                <X
                  size={16}
                />
              </button>
            )}

            <ChevronDown
              size={17}
              className="searchable-select-chevron"
            />
          </div>
        </div>
      ) : (
        <div
          className={`searchable-select-input-wrapper ${
            disabled
              ? "disabled"
              : ""
          }`}
        >
          <Search
            size={17}
            className="searchable-select-search-icon"
          />

          <input
            type="text"
            value={
              busqueda
            }
            disabled={
              disabled
            }
            required={
              required &&
              !valorSeleccionado
            }
            placeholder={
              placeholder
            }
            onChange={
              handleBusqueda
            }
            onFocus={() =>
              setAbierto(true)
            }
            autoComplete="off"
          />

          {cargando && (
            <LoaderCircle
              size={17}
              className="searchable-select-loader"
            />
          )}

          {!cargando && (
            <ChevronDown
              size={17}
              className="searchable-select-chevron"
            />
          )}
        </div>
      )}

      {abierto &&
        !disabled && (
          <div className="searchable-select-dropdown">
            {!opcionSeleccionada && (
              <>
                {busqueda
                  .trim()
                  .length <
                minChars ? (
                  <div className="searchable-select-message">
                    Escriba al menos{" "}
                    <strong>
                      {minChars}
                    </strong>{" "}
                    caracteres para
                    buscar.
                  </div>
                ) : cargando ? (
                  <div className="searchable-select-message">
                    <LoaderCircle
                      size={16}
                      className="searchable-select-loader"
                    />

                    Buscando...
                  </div>
                ) : error ? (
                  <div className="searchable-select-message error">
                    {error}
                  </div>
                ) : resultados.length ===
                  0 ? (
                  <div className="searchable-select-message">
                    {
                      emptyMessage
                    }
                  </div>
                ) : (
                  <div className="searchable-select-options">
                    {resultados.map(
                      (item) => {
                        const id =
                          getOptionValue(
                            item
                          );

                        const label =
                          getOptionLabel(
                            item
                          );

                        const descripcion =
                          getOptionDescription
                            ? getOptionDescription(
                                item
                              )
                            : null;

                        return (
                          <button
                            key={
                              id
                            }
                            type="button"
                            className="searchable-select-option"
                            onClick={() =>
                              seleccionarOpcion(
                                item
                              )
                            }
                          >
                            <span className="searchable-select-option-label">
                              {
                                label
                              }
                            </span>

                            {descripcion && (
                              <span className="searchable-select-option-description">
                                {
                                  descripcion
                                }
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </>
            )}

            {opcionSeleccionada && (
              <div className="searchable-select-message">
                Presione la{" "}
                <strong>
                  X
                </strong>{" "}
                para cambiar la
                selección.
              </div>
            )}
          </div>
        )}

      <input
        type="hidden"
        value={
          valorSeleccionado
        }
        readOnly
      />
    </div>
  );
};

export default SearchableSelect;