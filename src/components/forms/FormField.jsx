const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};

const errorStyle = {
  color: "#b00020",
  fontSize: "0.85rem",
  marginTop: "0.25rem",
};

export default function FormField({
  label,
  error,
  type = "text",
  required = false,
  ...fieldProps
}) {
  return (
    <label style={fieldStyle}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <div>
        <input
          type={type}
          aria-invalid={error ? "true" : "false"}
          {...fieldProps}
        />

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </label>
  );
}
