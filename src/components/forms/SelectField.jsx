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

export default function SelectField({
  label,
  error,
  options = [],
  required = false,
  placeholder = "Bitte auswählen",
  optionValueKey = "id",
  optionLabelKey = "label",
  includePlaceholder = true,
  ...fieldProps
}) {
  return (
    <label style={fieldStyle}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <div>
        <select aria-invalid={error ? "true" : "false"} {...fieldProps}>
          {includePlaceholder && <option value="">{placeholder}</option>}

          {options.map((option) => {
            const value = option[optionValueKey];
            const labelText = option[optionLabelKey];

            return (
              <option key={value || "__empty"} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </label>
  );
}
