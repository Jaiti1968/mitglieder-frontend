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
        {...register("ehemaligeStimme")}
      />

      <DateField
        label="Übergabe am"
        error={errors.uebergabeAm?.message}
        {...register("uebergabeAm")}
      />

      <FormField
        label="Bemerkung Übergabe"
        error={errors.bemerkungUebergabe?.message}
        {...register("bemerkungUebergabe")}
      />

      <CheckboxField label="Neubeschaffung" {...register("neubeschaffung")} />

      <DateField
        label="Datum Anteil"
        error={errors.datumAnteil?.message}
        {...register("datumAnteil")}
      />

      <CheckboxField label="Barzahlung" {...register("barzahlung")} />

      <FormField
        label="Bearbeitungsstand"
        error={errors.bearbeitungsstand?.message}
        {...register("bearbeitungsstand")}
      />

      <DateField
        label="Rückgabe am"
        error={errors.rueckgabeAm?.message}
        {...register("rueckgabeAm")}
      />

      <FormField
        label="Bemerkung Rückgabe"
        error={errors.bemerkungRueckgabe?.message}
        {...register("bemerkungRueckgabe")}
      />

      <DateField
        label="Kaufdatum"
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

      <DateField
        label="Sommerkleidung erhalten"
        error={errors.sommerkleidungErhalten?.message}
        {...register("sommerkleidungErhalten")}
      />

      <DateField
        label="Sommerkleidung Rückgabe"
        error={errors.sommerkleidungRueckgabe?.message}
        {...register("sommerkleidungRueckgabe")}
      />
    </form>
  );
}
