export default function FilterChip({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? activeChipStyle : chipStyle}
    >
      {children}
    </button>
  );
}

const chipStyle = {
  borderRadius: "999px",
  padding: "0.4rem 0.75rem",
};

const activeChipStyle = {
  ...chipStyle,
  backgroundColor: "#1f5fbf",
  color: "#fff",
  borderColor: "#1f5fbf",
};
