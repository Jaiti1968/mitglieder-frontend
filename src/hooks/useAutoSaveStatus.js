import { useCallback, useMemo, useState } from "react";

export function useAutoSaveStatus() {
  const [savingForms, setSavingForms] = useState(new Set());
  const [failedForms, setFailedForms] = useState(new Set());

  const markSaving = useCallback((formName) => {
    setSavingForms((current) => {
      const next = new Set(current);
      next.add(formName);
      return next;
    });

    setFailedForms((current) => {
      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  const markSaved = useCallback((formName) => {
    setSavingForms((current) => {
      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  const markFailed = useCallback((formName) => {
    setSavingForms((current) => {
      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setFailedForms((current) => {
      const next = new Set(current);
      next.add(formName);
      return next;
    });
  }, []);

  const clearFailed = useCallback((formName) => {
    setFailedForms((current) => {
      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      isSaving: savingForms.size > 0,
      hasSaveError: failedForms.size > 0,
      hasUnsavedChanges: savingForms.size > 0 || failedForms.size > 0,
      markSaving,
      markSaved,
      markFailed,
      clearFailed,
    }),
    [savingForms, failedForms, markSaving, markSaved, markFailed, clearFailed]
  );
}