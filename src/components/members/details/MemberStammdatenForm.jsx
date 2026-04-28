import { useState } from "react";

export default function MemberStammdatenForm({ stammdaten, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    anrede: stammdaten?.anrede ?? "",
    akademischerTitel: stammdaten?.akademischerTitel ?? "",
    vorname: stammdaten?.vorname ?? "",
    nachname: stammdaten?.nachname ?? "",
    geburtsdatum: stammdaten?.geburtsdatum ?? "",
    plz: stammdaten?.plz ?? "",
    ort: stammdaten?.ort ?? "",
    strasseHausNr: stammdaten?.strasseHausNr ?? "",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Anrede" name="anrede" value={formData.anrede} onChange={handleChange} />
      <FormField label="Akademischer Titel" name="akademischerTitel" value={formData.akademischerTitel} onChange={handleChange} />
      <FormField label="Vorname" name="vorname" value={formData.vorname} onChange={handleChange} required />
      <FormField label="Nachname" name="nachname" value={formData.nachname} onChange={handleChange} required />
      <FormField label="Geburtsdatum" name="geburtsdatum" type="date" value={formData.geburtsdatum} onChange={handleChange} />
      <FormField label="Straße / Hausnr." name="strasseHausNr" value={formData.strasseHausNr} onChange={handleChange} />
      <FormField label="PLZ" name="plz" value={formData.plz} onChange={handleChange} />
      <FormField label="Ort" name="ort" value={formData.ort} onChange={handleChange} />

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="submit">Speichern</button>
        <button type="button" className="secondary" onClick={onCancel}>Abbrechen</button>
      </div>
    </form>
  );
}

function FormField({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} required={required} />
    </label>
  );
}

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};