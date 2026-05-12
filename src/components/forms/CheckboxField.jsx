const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};

export default function CheckboxField({ label, ...fieldProps }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>

      <div>
        <input type="checkbox" {...fieldProps} />
      </div>
    </label>
  );
}
