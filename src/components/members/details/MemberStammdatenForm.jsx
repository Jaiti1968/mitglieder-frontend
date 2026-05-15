import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormField from "../../forms/FormField";
import SelectField from "../../forms/SelectField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateStammdaten } from "../../../utils/forms/validators";

export default function MemberStammdatenForm({
  stammdaten = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
  onValidationError,
  serverError,
  onClearServerError,
}) {
  const {
    register,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      personFirma: false,
      anrede: "Herr",
      akademischerTitel: "",
      vorname: "",
      nachname: "",
      geburtsdatum: "",
      plz: "",
      ort: "",
      strasseHausNr: "",
    },
  });

  const values = useWatch({ control });
  const isFirma = values?.personFirma === true;

  useEffect(() => {
    reset({
      personFirma: stammdaten?.personFirma ?? false,
      anrede: stammdaten?.anrede ?? "Herr",
      akademischerTitel: stammdaten?.akademischerTitel ?? "",
      vorname: stammdaten?.vorname ?? "",
      nachname: stammdaten?.nachname ?? "",
      geburtsdatum: stammdaten?.geburtsdatum ?? "",
      plz: stammdaten?.plz ?? "",
      ort: stammdaten?.ort ?? "",
      strasseHausNr: stammdaten?.strasseHausNr ?? "",
    });
  }, [stammdaten, reset]);

  useAutoSaveForm({
    control,
    isDirty,
    setError,
    clearErrors,
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onValidationError,
    onClearServerError,
    serverError,
    allowedServerFields: [
      "personFirma",
      "anrede",
      "akademischerTitel",
      "vorname",
      "nachname",
      "geburtsdatum",
      "plz",
      "ort",
      "strasseHausNr",
    ],
    validate: validateStammdaten,
    buildPayload: createPayload,
    resetDependencies: [stammdaten],
    errorLogLabel: "Auto-Save Stammdaten",
  });

  function handleTypeChange(type) {
    const nextIsFirma = type === "firma";

    setValue("personFirma", nextIsFirma, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (nextIsFirma) {
      setValue("anrede", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("akademischerTitel", "", {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue("geburtsdatum", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  return (
    <form noValidate>
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
            Firma / Organisation
          </button>
        </div>

        {errors.personFirma && (
          <span style={errorStyle}>{errors.personFirma.message}</span>
        )}
      </div>

      {!isFirma && (
        <SelectField
          label="Anrede"
          error={errors.anrede?.message}
          options={[
            { value: "Herr", label: "Herr" },
            { value: "Frau", label: "Frau" },
            { value: "", label: "Keine Anrede" },
          ]}
          optionValueKey="value"
          optionLabelKey="label"
          includePlaceholder={false}
          {...register("anrede")}
        />
      )}

      {!isFirma && (
        <TitleField
          value={values?.akademischerTitel ?? ""}
          error={errors.akademischerTitel?.message}
          onChange={(value) =>
            setValue("akademischerTitel", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      )}

      <FormField
        label={isFirma ? "Firmenzusatz" : "Vorname"}
        error={errors.vorname?.message}
        {...register("vorname")}
      />

      <FormField
        label={isFirma ? "Firmenname" : "Nachname"}
        required
        error={errors.nachname?.message}
        {...register("nachname")}
      />

      {!isFirma && (
        <FormField
          label="Geburtsdatum"
          type="text"
          placeholder="YYYY-MM-DD"
          error={errors.geburtsdatum?.message}
          {...register("geburtsdatum")}
        />
      )}

      <FormField
        label="Straße / Hausnr."
        error={errors.strasseHausNr?.message}
        {...register("strasseHausNr")}
      />

      <FormField label="PLZ" error={errors.plz?.message} {...register("plz")} />

      <FormField label="Ort" error={errors.ort?.message} {...register("ort")} />
    </form>
  );
}

function createPayload(values) {
  return {
    personFirma: values?.personFirma === true,
    anrede: values?.personFirma ? "" : (values?.anrede ?? ""),
    akademischerTitel: values?.personFirma
      ? ""
      : (values?.akademischerTitel ?? ""),
    vorname: values?.vorname ?? "",
    nachname: values?.nachname ?? "",
    geburtsdatum: values?.personFirma ? "" : (values?.geburtsdatum ?? ""),
    plz: values?.plz ?? "",
    ort: values?.ort ?? "",
    strasseHausNr: values?.strasseHausNr ?? "",
  };
}

function TitleField({ value, onChange, error }) {
  const predefinedTitles = ["Dr.", "Prof."];
  const selectedValue = predefinedTitles.includes(value) ? value : "";

  return (
    <div style={fieldStyle}>
      <span>Akademischer Titel</span>

      <div>
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

        {error && <div style={errorStyle}>{error}</div>}
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

const errorStyle = {
  color: "#b00020",
  fontSize: "0.85rem",
  marginTop: "0.25rem",
};
