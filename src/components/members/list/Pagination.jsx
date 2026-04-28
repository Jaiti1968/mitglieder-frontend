export default function Pagination({ page, pagination, setPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const totalPages = pagination.totalPages;
  const pages = getVisiblePages(page, totalPages);

  return (
    <nav style={paginationStyle} aria-label="Seitennavigation">
      <button
        type="button"
        className="secondary"
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
      >
        ← Zurück
      </button>

      <div style={pageNumbersStyle}>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} style={ellipsisStyle}>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={item === page ? "" : "secondary"}
              onClick={() => setPage(item)}
              disabled={item === page}
              aria-current={item === page ? "page" : undefined}
              style={item === page ? activePageButtonStyle : undefined}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="secondary"
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
      >
        Weiter →
      </button>
    </nav>
  );
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "…", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "…",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "…",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "…",
    totalPages,
  ];
}

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.75rem",
  margin: "1rem 0",
  flexWrap: "wrap",
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  flexWrap: "wrap",
};

const activePageButtonStyle = {
  backgroundColor: "#1f5fbf",
  color: "#fff",
  borderColor: "#1f5fbf",
};

const ellipsisStyle = {
  color: "#777",
  padding: "0 0.25rem",
};