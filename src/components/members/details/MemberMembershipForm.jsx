import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import SelectField from "../../forms/SelectField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import {
  validateCompleteDate,
  validateDateRange,
  validateRequired,
} from "../../../utils/forms/validationHelpers";

export default function MemberMembershipForm({
  mitgliedschaft = {},
  statuses = [],
  voices = [],
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
      eintritt: "",
      austritt: "",
      mitgliedsstatusId: "",
      stimmeId: "",
      kammerchor: false,
    },
  });

  useEffect(() => {
    reset({
      eintritt: mitgliedschaft?.eintritt ?? "",
      austritt: mitgliedschaft?.austritt ?? "",
      mitgliedsstatusId: mitgliedschaft?.mitgliedsstatusId ?? "",
      stimmeId: mitgliedschaft?.stimmeId ?? "",
      kammerchor: mitgliedschaft?.kammerchor ?? false,
    });
  }, [mitgliedschaft, reset]);

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
      "eintritt",
      "austritt",
      "mitgliedsstatusId",
      "stimmeId",
      "kammerchor",
    ],
    validate: validateMitgliedschaft,
    buildPayload: createPayload,
    resetDependencies: [mitgliedschaft],
    errorLogLabel: "Auto-Save Mitgliedschaft",
  });

  return (
    <form noValidate>
      <Controller
        name="eintritt"
        control={control}
        render={({ field }) => (
          <FormField
            label="Eintritt"
            type="text"
            placeholder="YYYY-MM-DD"
            error={errors.eintritt?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <Controller
        name="austritt"
        control={control}
        render={({ field }) => (
          <FormField
            label="Austritt"
            type="text"
            placeholder="YYYY-MM-DD"
            error={errors.austritt?.message}
            value={field.value ?? ""}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        )}
      />

      <SelectField
        label="Mitgliederstatus"
        required
        error={errors.mitgliedsstatusId?.message}
        options={statuses}
        {...register("mitgliedsstatusId")}
      />

      <SelectField
        label="Stimme"
        required
        error={errors.stimmeId?.message}
        options={voices}
        {...register("stimmeId")}
      />

      <CheckboxField label="Kammerchor" {...register("kammerchor")} />
    </form>
  );
}

function createPayload(values) {
  return {
    eintritt: values?.eintritt || null,
    austritt: values?.austritt || null,
    mitgliedsstatusId: values?.mitgliedsstatusId
      ? Number(values.mitgliedsstatusId)
      : null,
    stimmeId: values?.stimmeId ? Number(values.stimmeId) : null,
    kammerchor: values?.kammerchor === true,
  };
}

function validateMitgliedschaft(values) {
  const validationErrors = [];

  const eintritt = values?.eintritt ?? "";
  const austritt = values?.austritt ?? "";
  const mitgliedsstatusId = values?.mitgliedsstatusId ?? "";
  const stimmeId = values?.stimmeId ?? "";

  validateCompleteDate(
    validationErrors,
    "eintritt",
    eintritt,
    "Datum muss vollständig sein",
  );

  validateCompleteDate(
    validationErrors,
    "austritt",
    austritt,
    "Datum muss vollständig sein",
  );

  validateRequired(
    validationErrors,
    "mitgliedsstatusId",
    mitgliedsstatusId,
    "Mitgliederstatus ist Pflicht",
  );

  validateRequired(
    validationErrors,
    "stimmeId",
    stimmeId,
    "Stimme ist Pflicht",
  );

  validateDateRange(
    validationErrors,
    "eintritt",
    eintritt,
    "austritt",
    austritt,
    "Austritt darf nicht vor Eintritt liegen",
  );

  return validationErrors;
}
