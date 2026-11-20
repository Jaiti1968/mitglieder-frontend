import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
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
    defaultValues: createMitgliedschaftDefaults(mitgliedschaft),
  });

  const values = useWatch({ control });

  const lastTransferredValues = useRef(
    JSON.stringify(createMitgliedschaftDefaults(mitgliedschaft)),
  );

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
      const validationErrors = validateMitgliedschaft(values);

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

  useEffect(() => {
    if (createMode) return;

    reset(createMitgliedschaftDefaults(mitgliedschaft));
  }, [createMode, mitgliedschaft, reset]);

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
        disabled={readOnly}
      />

      <DateField
        name="austritt"
        control={control}
        label="Austritt"
        error={errors.austritt?.message}
        disabled={readOnly}
      />

      <SelectField
        label="Mitgliederstatus"
        required
        error={errors.mitgliedsstatusId?.message}
        options={statuses}
        disabled={readOnly}
        {...register("mitgliedsstatusId")}
      />

      <SelectField
        label="Stimme"
        required
        error={errors.stimmeId?.message}
        options={voices}
        disabled={readOnly}
        {...register("stimmeId")}
      />

      <CheckboxField
        label="Kammerchor"
        disabled={readOnly}
        {...register("kammerchor")}
      />
    </form>
  );
}
