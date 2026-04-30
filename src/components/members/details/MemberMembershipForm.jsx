import { useEffect, useState } from "react";

export default function MemberMembershipForm({
  mitgliedschaft = {},
  statuses = [],
  voices = [],
  onChange,
}) {
  const [formData, setFormData] = useState({
    mitgliedsstatusId:
      mitgliedschaft?.mitgliedsstatusId ?? "",
    stimmeId: mitgliedschaft?.stimmeId ?? "",
    eintrittsdatum: mitgliedschaft?.eintrittsdatum ?? "",
    austrittsdatum: mitgliedschaft?.austrittsdatum ?? "",
  });

  // 👉 Default setzen, sobald statuses da sind (aber OHNE Loop)
  const kandidatStatus = statuses.find(
    (s) => s.label?.toLowerCase() === "kandidat"
  );

  const effectiveStatusId =
    formData.mitgliedsstatusId ||
    kandidatStatus?.id ||
    (statuses.length > 0 ? statuses[0].id : "");

  // 👉 Auto-Save
  useEffect(() => {
    onChange({
      ...formData,
      mitgliedsstatusId: effectiveStatusId,
    });
  }, [formData, effectiveStatusId, onChange]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <form>
      <SelectField
        label="Status"
        name="mitgliedsstatusId"
        value={effectiveStatusId}
        onChange={handleChange}
        options={statuses.map((s) => ({
          value: s.id,
          label: s.label,
        }))}
      />

      <SelectField
        label="Stimme"
        name="stimmeId"
        value={formData.stimmeId}
        onChange={handleChange}
        options={[
          { value: "", label: "—" },
          ...voices.map((v) => ({
            value: v.id,
            label: v.label,
          })),
        ]}
      />

      <FormField
        label="Eintrittsdatum"
        name="eintrittsdatum"
        type="date"
        value={formData.eintrittsdatum}
        onChange={handleChange}
      />

      <FormField
        label="Austrittsdatum"
        name="austrittsdatum"
        type="date"
        value={formData.austrittsdatum}
        onChange={handleChange}
      />
    </form>
  );
}

/* ---------- Komponenten ---------- */

function FormField({ label, name, value, onChange, type = "text" }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <select name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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