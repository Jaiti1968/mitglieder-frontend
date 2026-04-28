export default function ResultInfo({ pagination, isFetching, isError }) {
  if (isError || !pagination) return null;

  return (
    <div style={resultInfoStyle}>
      <span>
        Seite <strong>{pagination.page}</strong> von{" "}
        <strong>{pagination.totalPages}</strong> ·{" "}
        <strong>{pagination.totalItems}</strong> Datensätze
      </span>

      {isFetching && <span>Lade...</span>}
    </div>
  );
}

const resultInfoStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "1rem 0 0.5rem",
  color: "#555",
};