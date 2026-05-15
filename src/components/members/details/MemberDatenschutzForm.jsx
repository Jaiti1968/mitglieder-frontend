import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import DateField from "../../forms/DateField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateDatenschutz } from "../../../utils/forms/validators";
import { createDatenschutzPayload } from "../../../utils/forms/payloads";
import { createDatenschutzDefaults } from "../../../utils/forms/defaults";

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
    defaultValues: createDatenschutzDefaults(),
  });

  useEffect(() => {
    reset(createDatenschutzDefaults(datenschutz));
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
      <DateField
        label="Datum Datenschutz"
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
