import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormField from "../../forms/FormField";
import { mapBackendValidationErrors } from "../../../utils/forms/backendErrorMapper";
import {
  validateEmail,
  validateMaxLength,
} from "../../../utils/forms/validationHelpers";

const AUTO_SAVE_DELAY_MS = 500;

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
  const isFirstRender = useRef(true);
  const lastValidationSignature = useRef("");

  const callbacksRef = useRef({
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onValidationError,
    onClearServerError,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChange,
      onAutoSaveStart,
      onAutoSaveSuccess,
      onAutoSaveError,
      onValidationError,
      onClearServerError,
    };
  }, [
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onValidationError,
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
      telefonPrivat: "",
      telefonGeschaeftlich: "",
      mobiltelefon: "",
      email: "",
      adresszusatz: "",
      briefanrede: "",
    },
  });

  const values = useWatch({ control });
  const valuesSignature = JSON.stringify(values);

  useEffect(() => {
    reset({
      telefonPrivat: kontakt?.telefonPrivat ?? "",
      telefonGeschaeftlich: kontakt?.telefonGeschaeftlich ?? "",
      mobiltelefon: kontakt?.mobiltelefon ?? "",
      email: kontakt?.email ?? "",
      adresszusatz: kontakt?.adresszusatz ?? "",
      briefanrede: kontakt?.briefanrede ?? "",
    });

    isFirstRender.current = true;
    lastValidationSignature.current = "";
  }, [kontakt, reset]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, [
      "telefonPrivat",
      "telefonGeschaeftlich",
      "mobiltelefon",
      "email",
      "adresszusatz",
      "briefanrede",
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
        const clientValidationErrors = validateKontakt(values);
        const validationSignature = JSON.stringify(clientValidationErrors);

        if (clientValidationErrors.length > 0) {
          callbacksRef.current.onValidationError?.();

          if (validationSignature !== lastValidationSignature.current) {
            clearErrors();

            clientValidationErrors.forEach((validationError) => {
              setError(validationError.field, {
                type: "client",
                message: validationError.message,
              });
            });

            lastValidationSignature.current = validationSignature;
          }

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
        console.error("Auto-Save Kontakt fehlgeschlagen:", error);

        const hasValidationErrors =
          Array.isArray(error?.validationErrors) &&
          error.validationErrors.length > 0;

        mapBackendValidationErrors(error, setError);

        if (hasValidationErrors) {
          callbacksRef.current.onValidationError?.();
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

function createPayload(values) {
  return {
    telefonPrivat: values.telefonPrivat ?? "",
    telefonGeschaeftlich: values.telefonGeschaeftlich ?? "",
    mobiltelefon: values.mobiltelefon ?? "",
    email: values.email ?? "",
    adresszusatz: values.adresszusatz ?? "",
    briefanrede: values.briefanrede ?? "",
  };
}

function validateKontakt(values) {
  const validationErrors = [];

  validateMaxLength(
    validationErrors,
    "email",
    values.email,
    100,
    "E-Mail darf maximal 100 Zeichen haben",
  );

  validateEmail(
    validationErrors,
    "email",
    values.email,
    "Bitte eine gültige E-Mail-Adresse eingeben",
  );

  validateMaxLength(
    validationErrors,
    "adresszusatz",
    values.adresszusatz,
    50,
    "Adresszusatz darf maximal 50 Zeichen haben",
  );

  return validationErrors;
}
