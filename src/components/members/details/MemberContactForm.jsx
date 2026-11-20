import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateKontakt } from "../../../utils/forms/validators";
import { createKontaktPayload } from "../../../utils/forms/payloads";
import { createKontaktDefaults } from "../../../utils/forms/defaults";

export default function MemberContactForm({
  kontakt = {},
  readOnly = false,
  onChange,
  createMode = false,
  onFormValuesChange,
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
    defaultValues: createKontaktDefaults(kontakt),
  });

  const values = useWatch({ control });

  const lastTransferredValues = useRef(
    JSON.stringify(createKontaktDefaults(kontakt)),
  );

  useEffect(() => {
    if (createMode) return;

    reset(createKontaktDefaults(kontakt));
  }, [createMode, kontakt, reset]);

  useEffect(() => {
    if (!createMode || !onFormValuesChange) return;

    const currentValues = JSON.stringify(values);

    if (currentValues === lastTransferredValues.current) return;

    lastTransferredValues.current = currentValues;

    onFormValuesChange(values);
  }, [createMode, values, onFormValuesChange]);

  useEffect(() => {
    if (!createMode) return;

    const timeoutId = setTimeout(() => {
      const validationErrors = validateKontakt(values);

      clearErrors();

      validationErrors.forEach(({ field, message }) => {
        setError(field, {
          type: "client",
          message,
        });
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [createMode, values, clearErrors, setError]);

  useAutoSaveForm({
    enabled: !readOnly,
    shouldAutoSave: () => !createMode,
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
      "telefonPrivat",
      "telefonGeschaeftlich",
      "mobiltelefon",
      "email",
      "adresszusatz",
      "briefanrede",
    ],
    validate: validateKontakt,
    buildPayload: createKontaktPayload,
    resetDependencies: [kontakt],
    errorLogLabel: "Auto-Save Kontakt",
  });

  return (
    <form noValidate>
      <FormField
        label="Telefon privat"
        disabled={readOnly}
        {...register("telefonPrivat")}
      />

      <FormField
        label="Telefon geschäftlich"
        disabled={readOnly}
        {...register("telefonGeschaeftlich")}
      />

      <FormField
        label="Mobiltelefon"
        disabled={readOnly}
        {...register("mobiltelefon")}
      />

      <FormField
        label="E-Mail"
        type="text"
        error={errors.email?.message}
        disabled={readOnly}
        {...register("email")}
      />

      <FormField
        label="Adresszusatz"
        error={errors.adresszusatz?.message}
        disabled={readOnly}
        {...register("adresszusatz")}
      />

      <FormField
        label="Briefanrede"
        disabled={readOnly}
        {...register("briefanrede")}
      />
    </form>
  );
}
