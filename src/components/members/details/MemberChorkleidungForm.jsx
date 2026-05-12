import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import {
  validateCompleteDate,
  validateDateRange,
  validateNotFutureDate,
} from "../../../utils/forms/validationHelpers";

export default function MemberChorkleidungForm({
  chorkleidung = {},
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

  useEffect(() => {
    reset({
      ehemaligeStimme: chorkleidung?.ehemaligeStimme ?? "",
      uebergabeAm: chorkleidung?.uebergabeAm ?? "",
      bemerkungUebergabe: chorkleidung?.bemerkungUebergabe ?? "",
      neubeschaffung: chorkleidung?.neubeschaffung ?? false,
      datumAnteil: chorkleidung?.datumAnteil ?? "",
      barzahlung: chorkleidung?.barzahlung ?? false,
      bearbeitungsstand: chorkleidung?.bearbeitungsstand ?? "",
      rueckgabeAm: chorkleidung?.rueckgabeAm ?? "",
      bemerkungRueckgabe: chorkleidung?.bemerkungRueckgabe ?? "",
      kaufdatum: chorkleidung?.kaufdatum ?? "",
      kaufpreis: formatKaufpreis(chorkleidung?.kaufpreis),
      sommerkleidung: chorkleidung?.sommerkleidung ?? false,
      sommerkleidungErhalten: chorkleidung?.sommerkleidungErhalten ?? "",
      sommerkleidungRueckgabe: chorkleidung?.sommerkleidungRueckgabe ?? "",
    });
  }, [chorkleidung, reset]);

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
    ],
    validate: validateChorkleidung,
    buildPayload: createPayload,
    resetDependencies: [chorkleidung],
    debounceMs: 1500,
    errorLogLabel: "Auto-Save Chorkleidung",
  });

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

      <Controller
        name="kaufpreis"
        control={control}
        render={({ field }) => (
          <FormField
            label="Kaufpreis (€)"
            type="text"
            placeholder="0,00"
            error={errors.kaufpreis?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={() => {
              field.onChange(formatKaufpreis(field.value));
              field.onBlur();
            }}
            name={field.name}
            ref={field.ref}
          />
        )}
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
    kaufpreis: parseKaufpreis(values?.kaufpreis),
    sommerkleidung: values?.sommerkleidung === true,
    sommerkleidungErhalten: values?.sommerkleidungErhalten || null,
    sommerkleidungRueckgabe: values?.sommerkleidungRueckgabe || null,
  };
}

function validateChorkleidung(values) {
  const validationErrors = [];

  validateCompleteDate(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "Datum muss vollständig sein",
  );
  validateCompleteDate(
    validationErrors,
    "datumAnteil",
    values?.datumAnteil,
    "Datum muss vollständig sein",
  );
  validateCompleteDate(
    validationErrors,
    "rueckgabeAm",
    values?.rueckgabeAm,
    "Datum muss vollständig sein",
  );
  validateCompleteDate(
    validationErrors,
    "kaufdatum",
    values?.kaufdatum,
    "Datum muss vollständig sein",
  );
  validateCompleteDate(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "Datum muss vollständig sein",
  );
  validateCompleteDate(
    validationErrors,
    "sommerkleidungRueckgabe",
    values?.sommerkleidungRueckgabe,
    "Datum muss vollständig sein",
  );

  validateNotFutureDate(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "Übergabe am darf nicht in der Zukunft liegen",
  );
  validateNotFutureDate(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "Sommerkleidung erhalten darf nicht in der Zukunft liegen",
  );

  validateDateRange(
    validationErrors,
    "uebergabeAm",
    values?.uebergabeAm,
    "rueckgabeAm",
    values?.rueckgabeAm,
    "Rückgabe darf nicht vor Übergabe liegen",
  );
  validateDateRange(
    validationErrors,
    "sommerkleidungErhalten",
    values?.sommerkleidungErhalten,
    "sommerkleidungRueckgabe",
    values?.sommerkleidungRueckgabe,
    "Sommerkleidung-Rückgabe darf nicht vor Erhalt liegen",
  );

  validateKaufpreis(validationErrors, values?.kaufpreis);

  return validationErrors;
}

function validateKaufpreis(validationErrors, value) {
  if (value === "" || value === null || value === undefined) {
    return;
  }

  const kaufpreis = parseKaufpreis(value);

  if (kaufpreis === null || Number.isNaN(kaufpreis)) {
    validationErrors.push({
      field: "kaufpreis",
      message: "Kaufpreis muss eine Zahl sein",
    });
    return;
  }

  if (kaufpreis < 0) {
    validationErrors.push({
      field: "kaufpreis",
      message: "Kaufpreis darf nicht negativ sein",
    });
  }
}

function parseKaufpreis(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalizedValue = String(value).trim().replace(",", ".");
  const parsedValue = Number(normalizedValue);

  return Number.isNaN(parsedValue) ? NaN : parsedValue;
}

function formatKaufpreis(value) {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsedValue = parseKaufpreis(value);

  if (parsedValue === null || Number.isNaN(parsedValue)) {
    return value;
  }

  return parsedValue.toFixed(2).replace(".", ",");
}
