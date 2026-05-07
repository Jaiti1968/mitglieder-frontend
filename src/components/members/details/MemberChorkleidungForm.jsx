import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberChorkleidungForm({
  chorkleidung = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
  serverError,
  onClearServerError,
}) {
  const isFirstRender = useRef(true);

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
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      ehemaligeStimme: "",
      uebergabeAm: "",
      bemerkungUebergabe: "",
      neubeschaffung: false,
      datumAnteil: "",
      barzahlung: false,
      bearbeitungsstand: "",
      rueckgabeAm: "",
      bemerkungRueckgabe: "",
      kaufdatum: "",
      kaufpreis: "",
      sommerkleidung: false,
      sommerkleidungErhalten: "",
      sommerkleidungRueckgabe: "",
    },
  });

  const values = useWatch({ control });
  const valuesSignature = JSON.stringify(values);

  useEffect(() => {
    reset({
      ehemaligeStimme: chorkleidung?.ehemaligeStimme ?? "",
      uebergabeAm: toDateOnly(chorkleidung?.uebergabeAm),
      bemerkungUebergabe: chorkleidung?.bemerkungUebergabe ?? "",
      neubeschaffung: chorkleidung?.neubeschaffung ?? false,
      datumAnteil: toDateOnly(chorkleidung?.datumAnteil),
      barzahlung: chorkleidung?.barzahlung ?? false,
      bearbeitungsstand: chorkleidung?.bearbeitungsstand ?? "",
      rueckgabeAm: toDateOnly(chorkleidung?.rueckgabeAm),
      bemerkungRueckgabe: chorkleidung?.bemerkungRueckgabe ?? "",
      kaufdatum: toDateOnly(chorkleidung?.kaufdatum),
      kaufpreis: chorkleidung?.kaufpreis ?? "",
      sommerkleidung: chorkleidung?.sommerkleidung ?? false,
      sommerkleidungErhalten: toDateOnly(chorkleidung?.sommerkleidungErhalten),
      sommerkleidungRueckgabe: toDateOnly(
        chorkleidung?.sommerkleidungRueckgabe,
      ),
    });

    isFirstRender.current = true;
  }, [chorkleidung, reset]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, [
      "ehemaligeStimme",
      "uebergabeAm",
      "bemerkungUebergabe",
      "neubeschaffung",
      "datumAnteil",
      "barzahlung",
      "bearbeitungsstand",
      "rueckgabeAm",
      "bemerkungRueckgabe",
      "kaufdatum",
      "kaufpreis",
      "sommerkleidung",
      "sommerkleidungErhalten",
      "sommerkleidungRueckgabe",
    ]);
  }, [serverError, setError]);

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
        const clientValidationErrors = validateChorkleidung(values);

        if (clientValidationErrors.length > 0) {
          clearErrors();

          clientValidationErrors.forEach((validationError) => {
            setError(validationError.field, {
              type: "client",
              message: validationError.message,
            });
          });

          return;
        }

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
        console.error("Auto-Save Chorkleidung fehlgeschlagen:", error);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesSignature, isDirty, clearErrors, setError]);

  return (
    <form noValidate>
      <FormField
        label="Ehemalige Stimme"
        error={errors.ehemaligeStimme?.message}
        {...register("ehemaligeStimme")}
      />

      <FormField
        label="Übergabe am"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.uebergabeAm?.message}
        {...register("uebergabeAm")}
      />

      <FormField
        label="Bemerkung Übergabe"
        error={errors.bemerkungUebergabe?.message}
        {...register("bemerkungUebergabe")}
      />

      <CheckboxField label="Neubeschaffung" {...register("neubeschaffung")} />

      <FormField
        label="Datum Anteil"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.datumAnteil?.message}
        {...register("datumAnteil")}
      />

      <CheckboxField label="Barzahlung" {...register("barzahlung")} />

      <FormField
        label="Bearbeitungsstand"
        error={errors.bearbeitungsstand?.message}
        {...register("bearbeitungsstand")}
      />

      <FormField
        label="Rückgabe am"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.rueckgabeAm?.message}
        {...register("rueckgabeAm")}
      />

      <FormField
        label="Bemerkung Rückgabe"
        error={errors.bemerkungRueckgabe?.message}
        {...register("bemerkungRueckgabe")}
      />

      <FormField
        label="Kaufdatum"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.kaufdatum?.message}
        {...register("kaufdatum")}
      />

      <FormField
        label="Kaufpreis"
        type="text"
        placeholder="0.00"
        error={errors.kaufpreis?.message}
        {...register("kaufpreis")}
      />

      <CheckboxField label="Sommerkleidung" {...register("sommerkleidung")} />

      <FormField
        label="Sommerkleidung erhalten"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.sommerkleidungErhalten?.message}
        {...register("sommerkleidungErhalten")}
      />

      <FormField
        label="Sommerkleidung Rückgabe"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.sommerkleidungRueckgabe?.message}
        {...register("sommerkleidungRueckgabe")}
      />
    </form>
  );
}

function createPayload(values) {
  return {
    ehemaligeStimme: values?.ehemaligeStimme ?? "",
    uebergabeAm: values?.uebergabeAm || null,
    bemerkungUebergabe: values?.bemerkungUebergabe ?? "",
    neubeschaffung: values?.neubeschaffung === true,
    datumAnteil: values?.datumAnteil || null,
    barzahlung: values?.barzahlung === true,
    bearbeitungsstand: values?.bearbeitungsstand ?? "",
    rueckgabeAm: values?.rueckgabeAm || null,
    bemerkungRueckgabe: values?.bemerkungRueckgabe ?? "",
    kaufdatum: values?.kaufdatum || null,
    kaufpreis:
      values?.kaufpreis === "" || values?.kaufpreis === null
        ? null
        : Number(values.kaufpreis),
    sommerkleidung: values?.sommerkleidung === true,
    sommerkleidungErhalten: values?.sommerkleidungErhalten || null,
    sommerkleidungRueckgabe: values?.sommerkleidungRueckgabe || null,
  };
}

function validateChorkleidung(values) {
  const validationErrors = [];

  validateDateTimeField(validationErrors, "uebergabeAm", values?.uebergabeAm);
  validateDateTimeField(validationErrors, "datumAnteil", values?.datumAnteil);
  validateDateTimeField(validationErrors, "rueckgabeAm", values?.rueckgabeAm);
  validateDateTimeField(validationErrors, "kaufdatum", values?.kaufdatum);
  validateDateTimeField(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
  );
  validateDateTimeField(
    validationErrors,
    "sommerkleidungRueckgabe",
    values?.sommerkleidungRueckgabe,
  );

  if (
    isCompleteDate(values?.uebergabeAm) &&
    isCompleteDate(values?.rueckgabeAm) &&
    values.rueckgabeAm < values.uebergabeAm
  ) {
    validationErrors.push({
      field: "rueckgabeAm",
      message: "Rückgabe darf nicht vor Übergabe liegen",
    });
  }

  if (
    isCompleteDate(values?.sommerkleidungErhalten) &&
    isCompleteDate(values?.sommerkleidungRueckgabe) &&
    values.sommerkleidungRueckgabe < values.sommerkleidungErhalten
  ) {
    validationErrors.push({
      field: "sommerkleidungRueckgabe",
      message: "Sommerkleidung-Rückgabe darf nicht vor Erhalt liegen",
    });
  }

  if (values?.kaufpreis !== "" && values?.kaufpreis !== null) {
    const kaufpreis = Number(values.kaufpreis);

    if (Number.isNaN(kaufpreis)) {
      validationErrors.push({
        field: "kaufpreis",
        message: "Kaufpreis muss eine Zahl sein",
      });
    } else if (kaufpreis < 0) {
      validationErrors.push({
        field: "kaufpreis",
        message: "Kaufpreis darf nicht negativ sein",
      });
    }
  }

  return validationErrors;
}

function validateDateTimeField(validationErrors, field, value) {
  if (value && !isCompleteDate(value)) {
    validationErrors.push({
      field,
      message: "Datum muss vollständig sein",
    });
  }
}

function isCompleteDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");
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

function FormField({ label, error, type = "text", ...fieldProps }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>

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

function CheckboxField({ label, ...fieldProps }) {
  return (
    <label style={fieldStyle}>
      <span>{label}</span>

      <div>
        <input type="checkbox" {...fieldProps} />
      </div>
    </label>
  );
}

function toDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 180px) minmax(0, 1fr)",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "0.5rem",
};

const errorStyle = {
  color: "#b00020",
  fontSize: "0.85rem",
  marginTop: "0.25rem",
};
