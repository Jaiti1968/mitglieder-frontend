import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import SelectField from "../../forms/SelectField";
import useAutoSaveForm from "../../../hooks/forms/useAutoSaveForm";
import { validateMitgliedschaft } from "../../../utils/forms/validators";
import { createMitgliedschaftPayload } from "../../../utils/forms/payloads";
import { createMitgliedschaftDefaults } from "../../../utils/forms/defaults";

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
    defaultValues: createMitgliedschaftDefaults(),
  });

  useEffect(() => {
    reset(createMitgliedschaftDefaults(mitgliedschaft));
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
    buildPayload: createMitgliedschaftPayload,
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
