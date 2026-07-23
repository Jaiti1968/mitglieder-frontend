export default function FilterGroup({ title, children }) {
  return (
    <div style={groupStyle}>
      <strong>{title}</strong>
      <div style={chipContainerStyle}>{children}</div>
    </div>
  );
}

const groupStyle = {
  marginTop: "1rem",
};

const chipContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginTop: "0.5rem",
};
