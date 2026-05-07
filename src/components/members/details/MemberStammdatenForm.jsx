import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberStammdatenForm({
  stammdaten = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
  serverError,
  onClearServerError,
}) {
  const isFirstRender = useRef(true);
  const lastValidationSignature = useRef("");

  const callbacksRef = useRef({
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onClearServerError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChange,
      onAutoSaveStart,
      onAutoSaveSuccess,
      onAutoSaveError,
      onClearServerError,
    };
  }, [
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onClearServerError,
  ]);

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
  const valuesSignature = JSON.stringify(values);
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

    isFirstRender.current = true;
    lastValidationSignature.current = "";
  }, [stammdaten, reset]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, [
      "personFirma",
      "anrede",
      "akademischerTitel",
      "vorname",
      "nachname",
      "geburtsdatum",
      "plz",
      "ort",
      "strasseHausNr",
    ]);
  }, [serverError, setError]);

  useEffect(() => {
    if (isFirma) {
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
  }, [isFirma, setValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isDirty) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const clientValidationErrors = validateStammdaten(values);
        const validationSignature = JSON.stringify(clientValidationErrors);

        if (clientValidationErrors.length > 0) {
          if (validationSignature !== lastValidationSignature.current) {
            clearErrors();

            clientValidationErrors.forEach((validationError) => {
              setError(validationError.field, {
                type: "client",
                message: validationError.message,
              });
            });

            lastValidationSignature.current = validationSignature;
          }

          return;
        }

        lastValidationSignature.current = "";

        callbacksRef.current.onClearServerError?.();
        clearErrors();

        callbacksRef.current.onAutoSaveStart?.();

        const payload = createPayload(values);
        const result = callbacksRef.current.onChange?.(payload);

        if (result instanceof Promise) {
          await result;
        }

        callbacksRef.current.onAutoSaveSuccess?.();
      } catch (error) {
        console.error("Auto-Save Stammdaten fehlgeschlagen:", error);

        const hasValidationErrors =
          Array.isArray(error?.validationErrors) &&
          error.validationErrors.length > 0;

        mapBackendValidationErrors(error, setError);

        if (hasValidationErrors) {
          return;
        }

        callbacksRef.current.onAutoSaveError?.();
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // Wichtig: values ist bewusst nicht in den Dependencies.
    // valuesSignature steuert den Effekt stabil und verhindert Autosave-Loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesSignature, isDirty, clearErrors, setError]);

  function handleTypeChange(type) {
    const nextIsFirma = type === "firma";

    const nextValues = {
      ...values,
      personFirma: nextIsFirma,
      anrede: nextIsFirma ? "" : values.anrede,
      akademischerTitel: nextIsFirma ? "" : values.akademischerTitel,
      geburtsdatum: nextIsFirma ? "" : values.geburtsdatum,
    };

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

    callbacksRef.current.onChange?.(createPayload(nextValues));
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
          {...register("anrede")}
          options={[
            { value: "Herr", label: "Herr" },
            { value: "Frau", label: "Frau" },
            { value: "", label: "Keine Anrede" },
          ]}
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
          type="date"
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
    ...values,
    personFirma: values?.personFirma === true,
    anrede: values?.personFirma ? "" : (values?.anrede ?? ""),
    akademischerTitel: values?.personFirma
      ? ""
      : (values?.akademischerTitel ?? ""),
    geburtsdatum: values?.personFirma ? "" : (values?.geburtsdatum ?? ""),
    vorname: values?.vorname ?? "",
    nachname: values?.nachname ?? "",
    plz: values?.plz ?? "",
    ort: values?.ort ?? "",
    strasseHausNr: values?.strasseHausNr ?? "",
  };
}

function validateStammdaten(values) {
  const validationErrors = [];

  const isFirma = values?.personFirma === true;
  const vorname = values?.vorname ?? "";
  const nachname = values?.nachname ?? "";
  const anrede = values?.anrede ?? "";
  const akademischerTitel = values?.akademischerTitel ?? "";
  const plz = values?.plz ?? "";
  const ort = values?.ort ?? "";
  const strasseHausNr = values?.strasseHausNr ?? "";

  if (!isFirma && !vorname.trim()) {
    validationErrors.push({
      field: "vorname",
      message: "Vorname darf bei Personen nicht leer sein",
    });
  }

  if (!nachname.trim()) {
    validationErrors.push({
      field: "nachname",
      message: isFirma ? "Firmenname ist Pflicht" : "Nachname ist Pflicht",
    });
  }

  if (vorname.length > 50) {
    validationErrors.push({
      field: "vorname",
      message: isFirma
        ? "Firmenzusatz darf maximal 50 Zeichen haben"
        : "Vorname darf maximal 50 Zeichen haben",
    });
  }

  if (nachname.length > 50) {
    validationErrors.push({
      field: "nachname",
      message: isFirma
        ? "Firmenname darf maximal 50 Zeichen haben"
        : "Nachname darf maximal 50 Zeichen haben",
    });
  }

  if (anrede.length > 50) {
    validationErrors.push({
      field: "anrede",
      message: "Anrede darf maximal 50 Zeichen haben",
    });
  }

  if (akademischerTitel.length > 50) {
    validationErrors.push({
      field: "akademischerTitel",
      message: "Akademischer Titel darf maximal 50 Zeichen haben",
    });
  }

  if (plz.length > 50) {
    validationErrors.push({
      field: "plz",
      message: "PLZ darf maximal 50 Zeichen haben",
    });
  }

  if (ort.length > 50) {
    validationErrors.push({
      field: "ort",
      message: "Ort darf maximal 50 Zeichen haben",
    });
  }

  if (strasseHausNr.length > 50) {
    validationErrors.push({
      field: "strasseHausNr",
      message: "Straße/Hausnummer darf maximal 50 Zeichen haben",
    });
  }

  return validationErrors;
}

function mapBackendValidationErrors(error, setError, allowedFields = null) {
  if (!Array.isArray(error?.validationErrors)) {
    return;
  }

  error.validationErrors.forEach((validationError) => {
    if (!validationError?.field) {
      return;
    }

    if (allowedFields && !allowedFields.includes(validationError.field)) {
      return;
    }

    setError(validationError.field, {
      type: "server",
      message: validationError.message || "Ungültiger Wert",
    });
  });
}

function FormField({
  label,
  error,
  type = "text",
  required = false,
  ...fieldProps
}) {
  return (
    <label style={fieldStyle}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>

      <div>
        <input
          type={type}
          aria-invalid={error ? "true" : "false"}
          {...fieldProps}
        />

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </label>
  );
}

function SelectField({ label, error, options, ...fieldProps }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>

      <div>
        <select aria-invalid={error ? "true" : "false"} {...fieldProps}>
          {options.map((option) => (
            <option key={option.value || "__empty"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </label>
  );
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
