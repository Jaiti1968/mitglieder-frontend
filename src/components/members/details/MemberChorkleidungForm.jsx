import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import { mapBackendValidationErrors } from "../../../utils/forms/backendErrorMapper";
import { toDateOnly } from "../../../utils/forms/dateHelpers";
import {
  validateCompleteDate,
  validateDateRange,
} from "../../../utils/forms/validationHelpers";

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
    uebergabeAm: toLocalDateTime(values?.uebergabeAm),
    bemerkungUebergabe: values?.bemerkungUebergabe ?? "",
    neubeschaffung: values?.neubeschaffung === true,
    datumAnteil: toLocalDateTime(values?.datumAnteil),
    barzahlung: values?.barzahlung === true,
    bearbeitungsstand: values?.bearbeitungsstand ?? "",
    rueckgabeAm: toLocalDateTime(values?.rueckgabeAm),
    bemerkungRueckgabe: values?.bemerkungRueckgabe ?? "",
    kaufdatum: toLocalDateTime(values?.kaufdatum),
    kaufpreis:
      values?.kaufpreis === "" || values?.kaufpreis === null
        ? null
        : Number(values.kaufpreis),
    sommerkleidung: values?.sommerkleidung === true,
    sommerkleidungErhalten: toLocalDateTime(values?.sommerkleidungErhalten),
    sommerkleidungRueckgabe: toLocalDateTime(values?.sommerkleidungRueckgabe),
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

  const kaufpreis = Number(value);

  if (Number.isNaN(kaufpreis)) {
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

function toLocalDateTime(value) {
  return value ? `${value}T00:00:00` : null;
}
