import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateDatenschutz } from "../../../utils/forms/validators";
import { createDatenschutzPayload } from "../../../utils/forms/payloads";

export default function MemberDatenschutzForm({
  datenschutz = {},
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
      datumDatenschutz: "",
      datenschutzNr14: false,
      datenschutzNr15: false,
      datenschutzNr16: false,
      datenschutzNr17: false,
      datenschutzNr18: false,
    },
  });

  useEffect(() => {
    reset({
      datumDatenschutz: datenschutz?.datumDatenschutz ?? "",
      datenschutzNr14: datenschutz?.datenschutzNr14 ?? false,
      datenschutzNr15: datenschutz?.datenschutzNr15 ?? false,
      datenschutzNr16: datenschutz?.datenschutzNr16 ?? false,
      datenschutzNr17: datenschutz?.datenschutzNr17 ?? false,
      datenschutzNr18: datenschutz?.datenschutzNr18 ?? false,
    });
  }, [datenschutz, reset]);

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
      "datumDatenschutz",
      "datenschutzNr14",
      "datenschutzNr15",
      "datenschutzNr16",
      "datenschutzNr17",
      "datenschutzNr18",
    ],
    validate: validateDatenschutz,
    buildPayload: createDatenschutzPayload,
    resetDependencies: [datenschutz],
    errorLogLabel: "Auto-Save Datenschutz",
  });

  return (
    <form noValidate>
      <FormField
        label="Datum Datenschutz"
        type="text"
        placeholder="YYYY-MM-DD"
        error={errors.datumDatenschutz?.message}
        {...register("datumDatenschutz")}
      />

      <CheckboxField
        label="Datenschutz Nr. 14"
        {...register("datenschutzNr14")}
      />

      <CheckboxField
        label="Datenschutz Nr. 15"
        {...register("datenschutzNr15")}
      />

      <CheckboxField
        label="Datenschutz Nr. 16"
        {...register("datenschutzNr16")}
      />

      <CheckboxField
        label="Datenschutz Nr. 17"
        {...register("datenschutzNr17")}
      />

      <CheckboxField
        label="Datenschutz Nr. 18"
        {...register("datenschutzNr18")}
      />
    </form>
  );
}
