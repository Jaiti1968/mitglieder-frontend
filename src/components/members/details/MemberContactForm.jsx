import { useState } from "react";

export default function MemberContactForm({ kontakt, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    telefonPrivat: kontakt.telefonPrivat ?? "",
    telefonGeschaeftlich: kontakt.telefonGeschaeftlich ?? "",
    mobiltelefon: kontakt.mobiltelefon ?? "",
    email: kontakt.email ?? "",
    adresszusatz: kontakt.adresszusatz ?? "",
    briefanrede: kontakt.briefanrede ?? "",
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
      <FormField label="Telefon privat" name="telefonPrivat" value={formData.telefonPrivat} onChange={handleChange} />
      <FormField label="Telefon geschäftlich" name="telefonGeschaeftlich" value={formData.telefonGeschaeftlich} onChange={handleChange} />
      <FormField label="Mobiltelefon" name="mobiltelefon" value={formData.mobiltelefon} onChange={handleChange} />
      <FormField label="E-Mail" name="email" type="email" value={formData.email} onChange={handleChange} />
      <FormField label="Adresszusatz" name="adresszusatz" value={formData.adresszusatz} onChange={handleChange} />
      <FormField label="Briefanrede" name="briefanrede" value={formData.briefanrede} onChange={handleChange} />

      <div className="form-actions">  
        <button type="submit">Speichern</button>
        <button type="button" className="secondary" onClick={onCancel}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

function FormField({ label, name, value, onChange, type = "text" }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} />
    </label>
  );
}

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};