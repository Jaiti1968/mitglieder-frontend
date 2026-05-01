import { useEffect, useRef, useState } from "react";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberMembershipForm({
  mitgliedschaft = {},
  statuses = [],
  voices = [],
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
}) {
  const isFirstRender = useRef(true);

  const [formData, setFormData] = useState({
    mitgliedsstatusId: mitgliedschaft?.mitgliedsstatusId ?? "",
    stimmeId: mitgliedschaft?.stimmeId ?? "",
    eintritt: mitgliedschaft?.eintritt ?? "",
    austritt: mitgliedschaft?.austritt ?? "",
    kammerchor: mitgliedschaft?.kammerchor ?? false,
  });

  const kandidatStatus = statuses.find(
    (s) => s.label?.toLowerCase() === "kandidat"
  );

  const effectiveStatusId =
    formData.mitgliedsstatusId ||
    kandidatStatus?.id ||
    (statuses.length > 0 ? statuses[0].id : "");

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        onAutoSaveStart?.();

        const payload = {
          eintritt: formData.eintritt || null,
          austritt: formData.austritt || null,
          mitgliedsstatusId: Number(effectiveStatusId),
          stimmeId: formData.stimmeId ? Number(formData.stimmeId) : null,
          kammerchor: Boolean(formData.kammerchor),
        };

        const result = onChange?.(payload);

        if (result instanceof Promise) {
          await result;
        }

        onAutoSaveSuccess?.();
      } catch (error) {
        console.error("Auto-Save Mitgliedschaft fehlgeschlagen:", error);
        onAutoSaveError?.();
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };

    // Wichtig: onChange NICHT in Dependencies, sonst Save-Loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, effectiveStatusId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form>
      <SelectField
        label="Status"
        name="mitgliedsstatusId"
        value={effectiveStatusId}
        onChange={handleChange}
        options={statuses.map((status) => ({
          value: status.id,
          label: status.label,
        }))}
      />

      <SelectField
        label="Stimme"
        name="stimmeId"
        value={formData.stimmeId}
        onChange={handleChange}
        options={[
          { value: "", label: "—" },
          ...voices.map((voice) => ({
            value: voice.id,
            label: voice.label,
          })),
        ]}
      />

      <FormField
        label="Eintritt"
        name="eintritt"
        type="date"
        value={formData.eintritt ?? ""}
        onChange={handleChange}
      />

      <FormField
        label="Austritt"
        name="austritt"
        type="date"
        value={formData.austritt ?? ""}
        onChange={handleChange}
      />

      <CheckboxField
        label="Kammerchor"
        name="kammerchor"
        checked={formData.kammerchor}
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
      <input name={name} type={type} value={value} onChange={onChange} />
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

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ justifySelf: "start" }}
      />
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