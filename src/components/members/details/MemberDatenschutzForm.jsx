import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import CheckboxField from "../../forms/CheckboxField";
import FormField from "../../forms/FormField";
import { mapBackendValidationErrors } from "../../../utils/forms/backendErrorMapper";
import { toDateOnly } from "../../../utils/forms/dateHelpers";
import {
  validateCompleteDate,
  validateNotFutureDate,
} from "../../../utils/forms/validationHelpers";

const AUTO_SAVE_DELAY_MS = 500;

export default function MemberDatenschutzForm({
  datenschutz = {},
  onChange,
  onAutoSaveStart,
  onAutoSaveSuccess,
  onAutoSaveError,
  serverError,
  onClearServerError,
}) {
  const isFirstRender = useRef(true);

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
      datumDatenschutz: "",
      datenschutzNr14: false,
      datenschutzNr15: false,
      datenschutzNr16: false,
      datenschutzNr17: false,
      datenschutzNr18: false,
    },
  });

  const values = useWatch({ control });
  const valuesSignature = JSON.stringify(values);

  useEffect(() => {
    reset({
      datumDatenschutz: toDateOnly(datenschutz?.datumDatenschutz),
      datenschutzNr14: datenschutz?.datenschutzNr14 ?? false,
      datenschutzNr15: datenschutz?.datenschutzNr15 ?? false,
      datenschutzNr16: datenschutz?.datenschutzNr16 ?? false,
      datenschutzNr17: datenschutz?.datenschutzNr17 ?? false,
      datenschutzNr18: datenschutz?.datenschutzNr18 ?? false,
    });

    isFirstRender.current = true;
  }, [datenschutz, reset]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, [
      "datumDatenschutz",
      "datenschutzNr14",
      "datenschutzNr15",
      "datenschutzNr16",
      "datenschutzNr17",
      "datenschutzNr18",
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
        const clientValidationErrors = validateDatenschutz(values);

        if (clientValidationErrors.length > 0) {
          clearErrors();

          clientValidationErrors.forEach((validationError) => {
            setError(validationError.field, {
              type: "client",
              message: validationError.message,
            });
          });

          return;
        }

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
        console.error("Auto-Save Datenschutz fehlgeschlagen:", error);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesSignature, isDirty, clearErrors, setError]);

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

function createPayload(values) {
  return {
    datumDatenschutz: values?.datumDatenschutz
      ? `${values.datumDatenschutz}T00:00:00`
      : null,
    datenschutzNr14: values?.datenschutzNr14 === true,
    datenschutzNr15: values?.datenschutzNr15 === true,
    datenschutzNr16: values?.datenschutzNr16 === true,
    datenschutzNr17: values?.datenschutzNr17 === true,
    datenschutzNr18: values?.datenschutzNr18 === true,
  };
}

function validateDatenschutz(values) {
  const validationErrors = [];
  const datumDatenschutz = values?.datumDatenschutz ?? "";

  validateCompleteDate(
    validationErrors,
    "datumDatenschutz",
    datumDatenschutz,
    "Datum muss vollständig sein",
  );

  validateNotFutureDate(
    validationErrors,
    "datumDatenschutz",
    datumDatenschutz,
    "Datum Datenschutz darf nicht in der Zukunft liegen",
  );

  return validationErrors;
}
