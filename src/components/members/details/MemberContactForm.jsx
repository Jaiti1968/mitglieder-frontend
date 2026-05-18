import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateKontakt } from "../../../utils/forms/validators";
import { createKontaktPayload } from "../../../utils/forms/payloads";
import { createKontaktDefaults } from "../../../utils/forms/defaults";

export default function MemberContactForm({
  kontakt = {},
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
    defaultValues: createKontaktDefaults(),
  });

  useEffect(() => {
    reset(createKontaktDefaults(kontakt));
  }, [kontakt, reset]);

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
