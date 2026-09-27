import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Pagination = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems /
        pageSize
    )
  );

  const inicio =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          pageSize +
        1;

  const fin = Math.min(
    currentPage *
      pageSize,
    totalItems
  );

  const cambiarPagina = (
    pagina
  ) => {
    if (
      pagina < 1 ||
      pagina >
        totalPages ||
      pagina ===
        currentPage
    ) {
      return;
    }

    onPageChange(
      pagina
    );
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Mostrando{" "}
        <strong>
          {inicio}
        </strong>
        {" - "}
        <strong>
          {fin}
        </strong>
        {" de "}
        <strong>
          {totalItems}
        </strong>
      </div>

      <div className="pagination-controls">
        <div className="pagination-size">
          <span>
            Mostrar
          </span>

          <select
            value={
              pageSize
            }
            onChange={(
              event
            ) =>
              onPageSizeChange(
                Number(
                  event
                    .target
                    .value
                )
              )
            }
          >
            <option
              value={5}
            >
              5
            </option>

            <option
              value={10}
            >
              10
            </option>

            <option
              value={20}
            >
              20
            </option>

            <option
              value={50}
            >
              50
            </option>
          </select>
        </div>

        <button
          type="button"
          className="pagination-button"
          disabled={
            currentPage ===
            1
          }
          onClick={() =>
            cambiarPagina(
              currentPage -
                1
            )
          }
        >
          <ChevronLeft
            size={17}
          />
        </button>

        <span className="pagination-page">
          Página{" "}
          <strong>
            {currentPage}
          </strong>
          {" de "}
          <strong>
            {totalPages}
          </strong>
        </span>

        <button
          type="button"
          className="pagination-button"
          disabled={
            currentPage ===
            totalPages
          }
          onClick={() =>
            cambiarPagina(
              currentPage +
                1
            )
          }
        >
          <ChevronRight
            size={17}
          />
        </button>
      </div>
    </div>
  );
};

export default Pagination;