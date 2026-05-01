import { useEffect, useRef, useState } from "react";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberStammdatenForm({
  stammdaten = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
}) {
  const isFirstRender = useRef(true);
  const [isFirma, setIsFirma] = useState(stammdaten?.anrede === "");

  const [formData, setFormData] = useState({
    anrede: stammdaten?.anrede ?? "Herr",
    akademischerTitel: stammdaten?.akademischerTitel ?? "",
    vorname: stammdaten?.vorname ?? "",
    nachname: stammdaten?.nachname ?? "",
    geburtsdatum: stammdaten?.geburtsdatum ?? "",
    plz: stammdaten?.plz ?? "",
    ort: stammdaten?.ort ?? "",
    strasseHausNr: stammdaten?.strasseHausNr ?? "",
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        onAutoSaveStart?.();

        const payload = {
          ...formData,
          anrede: isFirma ? "" : formData.anrede,
          akademischerTitel: isFirma ? "" : formData.akademischerTitel,
          geburtsdatum: isFirma ? "" : formData.geburtsdatum,
        };

        const result = onChange?.(payload);

        if (result instanceof Promise) {
          await result;
        }

        onAutoSaveSuccess?.();
      } catch (error) {
        console.error("Auto-Save Stammdaten fehlgeschlagen:", error);
        onAutoSaveError?.();
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // Wichtig: onChange NICHT in Dependencies, sonst Save-Loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isFirma]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleTypeChange(type) {
    const nextIsFirma = type === "firma";
    setIsFirma(nextIsFirma);

    setFormData((current) => ({
      ...current,
      anrede: nextIsFirma ? "" : current.anrede || "Herr",
      akademischerTitel: nextIsFirma ? "" : current.akademischerTitel,
      geburtsdatum: nextIsFirma ? "" : current.geburtsdatum,
    }));
  }

  return (
    <form>
      <div style={fieldStyle}>
        <span>Art</span>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            style={!isFirma ? activeButtonStyle : undefined}
            className={isFirma ? "secondary" : ""}
            onClick={() => handleTypeChange("person")}
          >
            Person
          </button>

          <button
            type="button"
            style={isFirma ? activeButtonStyle : undefined}
            className={!isFirma ? "secondary" : ""}
            onClick={() => handleTypeChange("firma")}
          >
            Firma
          </button>
        </div>
      </div>

      {!isFirma && (
        <SelectField
          label="Anrede"
          name="anrede"
          value={formData.anrede}
          onChange={handleChange}
          options={[
            { value: "Herr", label: "Herr" },
            { value: "Frau", label: "Frau" },
          ]}
        />
      )}

      {!isFirma && (
        <TitleField
          value={formData.akademischerTitel}
          onChange={(value) =>
            setFormData((current) => ({
              ...current,
              akademischerTitel: value,
            }))
          }
        />
      )}

      <FormField
        label={isFirma ? "Firmenname Zusatz" : "Vorname"}
        name="vorname"
        value={formData.vorname}
        onChange={handleChange}
      />

      <FormField
        label={isFirma ? "Firmenname" : "Nachname"}
        name="nachname"
        value={formData.nachname}
        onChange={handleChange}
        required
      />

      {!isFirma && (
        <FormField
          label="Geburtsdatum"
          name="geburtsdatum"
          type="date"
          value={formData.geburtsdatum}
          onChange={handleChange}
        />
      )}

      <FormField
        label="Straße / Hausnr."
        name="strasseHausNr"
        value={formData.strasseHausNr}
        onChange={handleChange}
      />

      <FormField
        label="PLZ"
        name="plz"
        value={formData.plz}
        onChange={handleChange}
      />

      <FormField
        label="Ort"
        name="ort"
        value={formData.ort}
        onChange={handleChange}
      />
    </form>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
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

function TitleField({ value, onChange }) {
  const predefinedTitles = ["Dr.", "Prof."];
  const selectedValue = predefinedTitles.includes(value) ? value : "";

  return (
    <div style={fieldStyle}>
      <span>Akademischer Titel</span>

      <div style={titleInputWrapperStyle}>
        <select
          value={selectedValue}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Freitext</option>
          <option value="Dr.">Dr.</option>
          <option value="Prof.">Prof.</option>
        </select>

        <input
          type="text"
          placeholder="oder frei eingeben"
          value={selectedValue ? "" : value}
          onChange={(event) => onChange(event.target.value)}
          style={titleTextInputStyle}
        />
      </div>
    </div>
  );
}

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};

const titleInputWrapperStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

const titleTextInputStyle = {
  flex: 1,
  minWidth: "120px",
};

const activeButtonStyle = {
  backgroundColor: "#1f5fbf",
  color: "#fff",
  borderColor: "#1f5fbf",
};