import { useEffect, useRef, useState } from "react";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberContactForm({
  kontakt = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
}) {
  const isFirstRender = useRef(true);

  const [formData, setFormData] = useState({
    telefonPrivat: kontakt?.telefonPrivat ?? "",
    telefonGeschaeftlich: kontakt?.telefonGeschaeftlich ?? "",
    mobiltelefon: kontakt?.mobiltelefon ?? "",
    email: kontakt?.email ?? "",
    adresszusatz: kontakt?.adresszusatz ?? "",
    briefanrede: kontakt?.briefanrede ?? "",
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        onAutoSaveStart?.();

        const result = onChange?.(formData);

        if (result instanceof Promise) {
          await result;
        }

        onAutoSaveSuccess?.();
      } catch (error) {
        console.error("Auto-Save Kontakt fehlgeschlagen:", error);
        onAutoSaveError?.();
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // Wichtig: onChange NICHT in Dependencies, sonst Save-Loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
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