export default function RemovableFilterChip({ children, onRemove }) {
  return (
    <span style={removableChipStyle}>
      <span>{children}</span>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Filter entfernen"
        style={removeButtonStyle}
      >
        ×
      </button>
    </span>
  );
}

const removableChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  backgroundColor: "#eef3fb",
  color: "#1f4f8f",
  borderRadius: "999px",
  padding: "0.25rem 0.35rem 0.25rem 0.6rem",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const removeButtonStyle = {
  width: "1.4rem",
  height: "1.4rem",
  borderRadius: "999px",
  padding: 0,
  border: "none",
  backgroundColor: "transparent",
  color: "#1f4f8f",
  fontWeight: 700,
  lineHeight: 1,
};
