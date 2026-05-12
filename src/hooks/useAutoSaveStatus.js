import { useCallback, useMemo, useState } from "react";

const SAVED_VISIBLE_MS = 1500;

export function useAutoSaveStatus() {
  const [savingForms, setSavingForms] = useState(new Set());
  const [failedForms, setFailedForms] = useState(new Set());
  const [savedForms, setSavedForms] = useState(new Set());

  const markSaving = useCallback((formName) => {
    setSavingForms((current) => {
      if (current.has(formName)) return current;

      const next = new Set(current);
      next.add(formName);
      return next;
    });

    setFailedForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setSavedForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  const markSaved = useCallback((formName) => {
    setSavingForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setFailedForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setSavedForms((current) => {
      const next = new Set(current);
      next.add(formName);
      return next;
    });

    window.setTimeout(() => {
      setSavedForms((current) => {
        if (!current.has(formName)) return current;

        const next = new Set(current);
        next.delete(formName);
        return next;
      });
    }, SAVED_VISIBLE_MS);
  }, []);

  const markFailed = useCallback((formName) => {
    setSavingForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setSavedForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });

    setFailedForms((current) => {
      if (current.has(formName)) return current;

      const next = new Set(current);
      next.add(formName);
      return next;
    });
  }, []);

  const clearSaving = useCallback((formName) => {
    setSavingForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  const clearFailed = useCallback((formName) => {
    setFailedForms((current) => {
      if (!current.has(formName)) return current;

      const next = new Set(current);
      next.delete(formName);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      isSaving: savingForms.size > 0,
      hasSaveError: failedForms.size > 0,
      hasSaved: savedForms.size > 0,
      hasUnsavedChanges: savingForms.size > 0 || failedForms.size > 0,
      markSaving,
      markSaved,
      markFailed,
      clearSaving,
      clearFailed,
    }),
    [
      savingForms,
      failedForms,
      savedForms,
      markSaving,
      markSaved,
      markFailed,
      clearSaving,
      clearFailed,
    ],
  );
}
