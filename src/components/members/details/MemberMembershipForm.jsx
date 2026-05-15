import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import DateField from "../../forms/DateField";
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
      <DateField
        name="eintritt"
        control={control}
        label="Eintritt"
        error={errors.eintritt?.message}
      />

      <DateField
        name="austritt"
        control={control}
        label="Austritt"
        error={errors.austritt?.message}
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
