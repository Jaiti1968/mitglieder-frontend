import { useEffect, useState } from "react";

export default function MemberContactForm({ kontakt = {}, onChange }) {
  const [formData, setFormData] = useState({
    telefonPrivat: kontakt?.telefonPrivat ?? "",
    telefonGeschaeftlich: kontakt?.telefonGeschaeftlich ?? "",
    mobiltelefon: kontakt?.mobiltelefon ?? "",
    email: kontakt?.email ?? "",
    adresszusatz: kontakt?.adresszusatz ?? "",
    briefanrede: kontakt?.briefanrede ?? "",
  });

  // 👉 Auto-Save: bei jeder Änderung an Parent melden
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  return (
    <form>
      <FormField
        label="Telefon privat"
        name="telefonPrivat"
        value={formData.telefonPrivat}
        onChange={handleChange}
      />

      <FormField
        label="Telefon geschäftlich"
        name="telefonGeschaeftlich"
        value={formData.telefonGeschaeftlich}
        onChange={handleChange}
      />

      <FormField
        label="Mobiltelefon"
        name="mobiltelefon"
        value={formData.mobiltelefon}
        onChange={handleChange}
      />

      <FormField
        label="E-Mail"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      <FormField
        label="Adresszusatz"
        name="adresszusatz"
        value={formData.adresszusatz}
        onChange={handleChange}
      />

      <FormField
        label="Briefanrede"
        name="briefanrede"
        value={formData.briefanrede}
        onChange={handleChange}
      />
    </form>
  );
}

/* ---------- Komponenten ---------- */

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
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

/* ---------- Styles ---------- */

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};