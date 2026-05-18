import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import DateField from "../../forms/DateField";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateChorkleidung } from "../../../utils/forms/validators";
import {
  createChorkleidungPayload,
  formatKaufpreis,
} from "../../../utils/forms/payloads";
import { createChorkleidungDefaults } from "../../../utils/forms/defaults";

export default function MemberChorkleidungForm({
  chorkleidung = {},
  readOnly = false,
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
    defaultValues: createChorkleidungDefaults(),
  });

  useEffect(() => {
    reset(createChorkleidungDefaults(chorkleidung));
  }, [chorkleidung, reset]);

  useAutoSaveForm({
    enabled: !readOnly,
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
    buildPayload: createChorkleidungPayload,
    resetDependencies: [chorkleidung],
    debounceMs: 1500,
    errorLogLabel: "Auto-Save Chorkleidung",
  });

  return (
    <form noValidate>
      <FormField
        label="Ehemalige Stimme"
        error={errors.ehemaligeStimme?.message}
        disabled={readOnly}
        {...register("ehemaligeStimme")}
      />

      <DateField
        name="uebergabeAm"
        control={control}
        label="Übergabe am"
        error={errors.uebergabeAm?.message}
        disabled={readOnly}
      />

      <FormField
        label="Bemerkung Übergabe"
        error={errors.bemerkungUebergabe?.message}
        disabled={readOnly}
        {...register("bemerkungUebergabe")}
      />

      <CheckboxField
        label="Neubeschaffung"
        disabled={readOnly}
        {...register("neubeschaffung")}
      />

      <DateField
        name="datumAnteil"
        control={control}
        label="Datum Anteil"
        error={errors.datumAnteil?.message}
        disabled={readOnly}
      />

      <CheckboxField
        label="Barzahlung"
        disabled={readOnly}
        {...register("barzahlung")}
      />

      <FormField
        label="Bearbeitungsstand"
        error={errors.bearbeitungsstand?.message}
        disabled={readOnly}
        {...register("bearbeitungsstand")}
      />

      <DateField
        name="rueckgabeAm"
        control={control}
        label="Rückgabe am"
        error={errors.rueckgabeAm?.message}
        disabled={readOnly}
      />

      <FormField
        label="Bemerkung Rückgabe"
        error={errors.bemerkungRueckgabe?.message}
        disabled={readOnly}
        {...register("bemerkungRueckgabe")}
      />

      <DateField
        name="kaufdatum"
        control={control}
        label="Kaufdatum"
        error={errors.kaufdatum?.message}
        disabled={readOnly}
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
            disabled={readOnly}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={() => {
              if (!readOnly) {
                field.onChange(formatKaufpreis(field.value));
              }

              field.onBlur();
            }}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <CheckboxField
        label="Sommerkleidung"
        disabled={readOnly}
        {...register("sommerkleidung")}
      />

      <DateField
        name="sommerkleidungErhalten"
        control={control}
        label="Sommerkleidung erhalten"
        error={errors.sommerkleidungErhalten?.message}
        disabled={readOnly}
      />

      <DateField
        name="sommerkleidungRueckgabe"
        control={control}
        label="Sommerkleidung Rückgabe"
        error={errors.sommerkleidungRueckgabe?.message}
        disabled={readOnly}
      />
    </form>
  );
}
