import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import SelectField from "../../forms/SelectField";
import { mapBackendValidationErrors } from "../../../utils/forms/backendErrorMapper";
import {
  validateCompleteDate,
  validateDateRange,
  validateRequired,
} from "../../../utils/forms/validationHelpers";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberMembershipForm({
  mitgliedschaft = {},
  statuses = [],
  voices = [],
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
  serverError,
  onClearServerError,
}) {
  const isFirstRender = useRef(true);
  const lastValidationSignature = useRef("");

  const callbacksRef = useRef({
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onClearServerError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChange,
      onAutoSaveStart,
      onAutoSaveSuccess,
      onAutoSaveError,
      onClearServerError,
    };
  }, [
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onClearServerError,
  ]);

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

  const values = useWatch({ control });
  const valuesSignature = JSON.stringify(values);

  useEffect(() => {
    reset({
      eintritt: mitgliedschaft?.eintritt ?? "",
      austritt: mitgliedschaft?.austritt ?? "",
      mitgliedsstatusId: mitgliedschaft?.mitgliedsstatusId ?? "",
      stimmeId: mitgliedschaft?.stimmeId ?? "",
      kammerchor: mitgliedschaft?.kammerchor ?? false,
    });

    isFirstRender.current = true;
    lastValidationSignature.current = "";
  }, [mitgliedschaft, reset]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, [
      "eintritt",
      "austritt",
      "mitgliedsstatusId",
      "stimmeId",
      "kammerchor",
    ]);
  }, [serverError, setError]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isDirty) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const clientValidationErrors = validateMitgliedschaft(values);
        const validationSignature = JSON.stringify(clientValidationErrors);

        if (clientValidationErrors.length > 0) {
          clearErrors();

          clientValidationErrors.forEach((validationError) => {
            setError(validationError.field, {
              type: "client",
              message: validationError.message,
            });
          });

          lastValidationSignature.current = validationSignature;

          return;
        }

        lastValidationSignature.current = "";

        callbacksRef.current.onClearServerError?.();
        clearErrors();

        callbacksRef.current.onAutoSaveStart?.();

        const payload = createPayload(values);
        const result = callbacksRef.current.onChange?.(payload);

        if (result instanceof Promise) {
          await result;
        }

        callbacksRef.current.onAutoSaveSuccess?.();
      } catch (error) {
        console.error("Auto-Save Mitgliedschaft fehlgeschlagen:", error);

        const hasValidationErrors =
          Array.isArray(error?.validationErrors) &&
          error.validationErrors.length > 0;

        mapBackendValidationErrors(error, setError);

        if (hasValidationErrors) {
          return;
        }

        callbacksRef.current.onAutoSaveError?.();
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // Wichtig: values ist bewusst nicht in den Dependencies.
    // valuesSignature steuert den Effekt stabil und verhindert Autosave-Loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesSignature, isDirty, clearErrors, setError]);

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
