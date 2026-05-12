import { useEffect, useRef } from "react";
import { useWatch } from "react-hook-form";
import {
  hasBackendValidationErrors,
  mapBackendValidationErrors,
} from "../../utils/forms/backendErrorMapper";

const DEFAULT_AUTO_SAVE_DELAY_MS = 500;

export default function useAutoSaveForm({
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
  allowedServerFields = null,
  validate = () => [],
  buildPayload = (values) => values,
  resetDependencies = [],
  autoSaveDependencies = [],
  debounceMs = DEFAULT_AUTO_SAVE_DELAY_MS,
  shouldAutoSave = () => true,
  errorLogLabel = "Auto-Save",
}) {
  const values = useWatch({ control });
  const valuesSignature = JSON.stringify(values ?? {});
  const resetDependenciesSignature = JSON.stringify(resetDependencies ?? []);
  const autoSaveDependenciesSignature = JSON.stringify(
    autoSaveDependencies ?? [],
  );

  const isFirstRender = useRef(true);
  const saveRunId = useRef(0);

  const callbacksRef = useRef({
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onValidationError,
    onClearServerError,
    validate,
    buildPayload,
    shouldAutoSave,
  });

  useEffect(() => {
    callbacksRef.current = {
      onChange,
      onAutoSaveStart,
      onAutoSaveSuccess,
      onAutoSaveError,
      onValidationError,
      onClearServerError,
      validate,
      buildPayload,
      shouldAutoSave,
    };
  }, [
    onChange,
    onAutoSaveStart,
    onAutoSaveSuccess,
    onAutoSaveError,
    onValidationError,
    onClearServerError,
    validate,
    buildPayload,
    shouldAutoSave,
  ]);

  useEffect(() => {
    isFirstRender.current = true;
    saveRunId.current += 1;
  }, [resetDependenciesSignature]);

  useEffect(() => {
    mapBackendValidationErrors(serverError, setError, allowedServerFields);
  }, [serverError, setError, allowedServerFields]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isDirty) {
      return;
    }

    if (!callbacksRef.current.shouldAutoSave?.(values)) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      if (!callbacksRef.current.shouldAutoSave?.(values)) {
        return;
      }

      const currentSaveRunId = saveRunId.current + 1;
      saveRunId.current = currentSaveRunId;

      try {
        const clientValidationErrors =
          callbacksRef.current.validate?.(values) ?? [];

        if (clientValidationErrors.length > 0) {
          callbacksRef.current.onValidationError?.();
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

        const payload = callbacksRef.current.buildPayload?.(values) ?? values;
        await Promise.resolve(callbacksRef.current.onChange?.(payload));

        if (currentSaveRunId === saveRunId.current) {
          callbacksRef.current.onAutoSaveSuccess?.();
        }
      } catch (error) {
        console.error(`${errorLogLabel} fehlgeschlagen:`, error);

        const hasMappedValidationErrors = mapBackendValidationErrors(
          error,
          setError,
          allowedServerFields,
        );

        if (hasMappedValidationErrors || hasBackendValidationErrors(error)) {
          callbacksRef.current.onValidationError?.();
          return;
        }

        if (currentSaveRunId === saveRunId.current) {
          callbacksRef.current.onAutoSaveError?.();
        }
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    valuesSignature,
    autoSaveDependenciesSignature,
    isDirty,
    clearErrors,
    setError,
    debounceMs,
    errorLogLabel,
  ]);
}
