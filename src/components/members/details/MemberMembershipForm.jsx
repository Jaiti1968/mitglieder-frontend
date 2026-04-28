import { useState } from "react";

export default function MemberMembershipForm({
  mitgliedschaft,
  statuses,
  voices,
  onSave,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    eintritt: mitgliedschaft.eintritt ?? "",
    austritt: mitgliedschaft.austritt ?? "",
    statusId:
      mitgliedschaft.statusId ?? mitgliedschaft.mitgliedsstatusId ?? "",
    stimmeId: mitgliedschaft.stimmeId ?? "",
    kammerchor: mitgliedschaft.kammerchor ?? false,
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      eintritt: formData.eintritt || null,
      austritt: formData.austritt || null,
      mitgliedsstatusId: Number(formData.statusId),
      stimmeId: Number(formData.stimmeId),
      kammerchor: formData.kammerchor,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="Eintritt"
        name="eintritt"
        type="date"
        value={formData.eintritt}
        onChange={handleChange}
      />

      <FormField
        label="Austritt"
        name="austritt"
        type="date"
        value={formData.austritt}
        onChange={handleChange}
      />

      <SelectField
        label="Status"
        name="statusId"
        value={formData.statusId}
        onChange={handleChange}
        options={statuses}
      />

      <SelectField
        label="Stimme"
        name="stimmeId"
        value={formData.stimmeId}
        onChange={handleChange}
        options={voices}
      />

      <CheckboxField
        label="Kammerchor"
        name="kammerchor"
        checked={formData.kammerchor}
        onChange={handleChange}
      />

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="submit">Speichern</button>
        <button type="button" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

/* ---------- Reusable Fields ---------- */

function FormField({ label, name, value, onChange, type = "text" }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <select name={name} value={value} onChange={onChange} required>
        <option value="">Bitte wählen</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <div style={checkboxFieldStyle}>
      <span>{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={checkboxStyle}
      />
    </div>
  );
}

/* ---------- Styles ---------- */

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};

const checkboxFieldStyle = {
  display: "grid",
  gridTemplateColumns: "180px auto",
  alignItems: "center",
  columnGap: "1rem",
  marginBottom: "0.5rem",
};

const checkboxStyle = {
  margin: 0,
  width: "16px",
  height: "16px",
};