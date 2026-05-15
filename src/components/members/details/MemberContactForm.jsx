import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateKontakt } from "../../../utils/forms/validators";
import { createKontaktPayload } from "../../../utils/forms/payloads";

export default function MemberContactForm({
  kontakt = {},
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
      telefonPrivat: "",
      telefonGeschaeftlich: "",
      mobiltelefon: "",
      email: "",
      adresszusatz: "",
      briefanrede: "",
    },
  });

  useEffect(() => {
    reset({
      telefonPrivat: kontakt?.telefonPrivat ?? "",
      telefonGeschaeftlich: kontakt?.telefonGeschaeftlich ?? "",
      mobiltelefon: kontakt?.mobiltelefon ?? "",
      email: kontakt?.email ?? "",
      adresszusatz: kontakt?.adresszusatz ?? "",
      briefanrede: kontakt?.briefanrede ?? "",
    });
  }, [kontakt, reset]);

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
      <FormField label="Telefon privat" {...register("telefonPrivat")} />

      <FormField
        label="Telefon geschäftlich"
        {...register("telefonGeschaeftlich")}
      />

      <FormField label="Mobiltelefon" {...register("mobiltelefon")} />

      <FormField
        label="E-Mail"
        type="text"
        error={errors.email?.message}
        {...register("email")}
      />

      <FormField
        label="Adresszusatz"
        error={errors.adresszusatz?.message}
        {...register("adresszusatz")}
      />

      <FormField label="Briefanrede" {...register("briefanrede")} />
    </form>
  );
}
