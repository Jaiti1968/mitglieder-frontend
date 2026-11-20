import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import DateField from "../../forms/DateField";
import DiscardChangesDialog from "../../common/DiscardChangesDialog";
import DeleteConfirmationDialog from "../../common/DeleteConfirmationDialog";
import SelectField from "../../forms/SelectField";
import { validateEhrung } from "../../../utils/forms/validators";
import { createEhrungPayload } from "../../../utils/forms/payloads";
import { formatIsoDateToGerman } from "../../../utils/forms/dateHelpers";

const EMPTY_VALUES = { honorTypeId: "", honorDate: "" };
const signature = (values) =>
  JSON.stringify({
    honorTypeId: String(values?.honorTypeId ?? ""),
    honorDate: values?.honorDate ?? "",
  });

export default function MemberHonorEditDialog({
  open,
  honor,
  onClose,
  onSave,
  onDelete,
  deleting = false,
  deleteError = null,
  honorTypes = [],
  existingHonors = [],
  honorTypesLoading = false,
  honorTypesError = false,
}) {
  const {
    register,
    control,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: EMPTY_VALUES,
  });
  const values = useWatch({ control });
  const [status, setStatus] = useState("idle");
  useEffect(() => {
    if (status !== "saved") return;

    const timeoutId = window.setTimeout(() => {
      setStatus("idle");
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [status]);
  const [saveError, setSaveError] = useState(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const closingRef = useRef(false);
  const savedSignature = useRef(signature(EMPTY_VALUES));
  const savingPromise = useRef(null);
  const currentHonorId = honor?.honorId;
  const onSaveRef = useRef(onSave);
  const existingHonorsRef = useRef(existingHonors);
  onSaveRef.current = onSave;
  existingHonorsRef.current = existingHonors;

  useEffect(() => {
    if (!open || !honor) return;
    const initial = {
      honorTypeId: String(honor.honorTypeId ?? ""),
      honorDate: honor.honorDate ? formatIsoDateToGerman(honor.honorDate) : "",
    };
    reset(initial);
    savedSignature.current = signature(initial);
    setStatus("idle");
    setSaveError(null);
    setConfirmDiscard(false);
    setConfirmDelete(false);
    closingRef.current = false;
    clearErrors();
    // Nur bei einem neuen Öffnen oder Wechsel des Datensatzes zurücksetzen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentHonorId, reset]);

  const showValidationErrors = useCallback(
    (validationErrors) => {
      clearErrors();
      validationErrors.forEach(({ field, message }) => {
        setError(field, { type: "client", message });
      });
    },
    [clearErrors, setError],
  );

  const saveCurrentValues = useCallback(async () => {
    if (savingPromise.current) return savingPromise.current;

    const current = getValues();
    if (signature(current) === savedSignature.current) return true;

    const validationErrors = validateEhrung(
      current,
      existingHonorsRef.current,
      currentHonorId,
    );
    if (
      validationErrors.length ||
      honorTypesLoading ||
      honorTypesError ||
      !honorTypes.length
    ) {
      showValidationErrors(validationErrors);
      return false;
    }

    clearErrors();
    setSaveError(null);
    setStatus("saving");
    const snapshot = signature(current);
    const task = (async () => {
      try {
        await onSaveRef.current(createEhrungPayload(current));
        savedSignature.current = snapshot;
        setStatus("saved");
        return true;
      } catch (error) {
        setSaveError(error);
        setStatus("error");
        return false;
      }
    })();
    savingPromise.current = task;
    try {
      return await task;
    } finally {
      savingPromise.current = null;
    }
  }, [
    getValues,
    currentHonorId,
    honorTypesLoading,
    honorTypesError,
    honorTypes.length,
    clearErrors,
    showValidationErrors,
  ]);

  const saveRef = useRef(saveCurrentValues);
  saveRef.current = saveCurrentValues;
  const closeRef = useRef(null);

  const handleClose = useCallback(async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      if (savingPromise.current) await savingPromise.current;
      if (signature(getValues()) !== savedSignature.current) {
        const success = await saveRef.current();
        if (!success) {
          setConfirmDiscard(true);
          return;
        }
      }
      onClose();
    } finally {
      closingRef.current = false;
    }
  }, [getValues, onClose]);
  closeRef.current = handleClose;

  const valuesSignature = signature(values);
  useEffect(() => {
    if (
      !open ||
      !honor ||
      confirmDiscard ||
      confirmDelete ||
      deleting ||
      valuesSignature === savedSignature.current
    )
      return;
    const timer = window.setTimeout(async () => {
      const success = await saveRef.current();
      // Wenn während des Speicherns weitere Änderungen vorgenommen wurden,
      // wird der nächste Speichervorgang durch die Änderung ausgelöst.
      if (!success) return;
    }, 500);
    return () => window.clearTimeout(timer);
  }, [open, currentHonorId, valuesSignature, confirmDiscard, confirmDelete, deleting]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (confirmDelete) {
          if (!deleting) setConfirmDelete(false);
        } else if (confirmDiscard) {
          setConfirmDiscard(false);
        } else {
          void closeRef.current?.();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, confirmDiscard, confirmDelete, deleting]);

  if (!open || !honor) return null;

  const dirty = valuesSignature !== savedSignature.current;
  const busy = status === "saving";

  return (
    <div className="dialog-backdrop">
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="honor-edit-title"
        style={{ maxWidth: "600px" }}
      >
        <h2 id="honor-edit-title">Ehrung bearbeiten</h2>
        <form noValidate onSubmit={(event) => event.preventDefault()}>
          <SelectField
            label="Ehrungsart"
            required
            options={honorTypes}
            error={errors.honorTypeId?.message}
            disabled={busy || honorTypesLoading || honorTypesError}
            {...register("honorTypeId")}
          />
          {honorTypesLoading && (
            <p role="status">Ehrungsarten werden geladen...</p>
          )}
          {honorTypesError && (
            <p role="alert">Die Ehrungsarten konnten nicht geladen werden.</p>
          )}
          <DateField
            name="honorDate"
            control={control}
            label="Ehrungsdatum"
            error={errors.honorDate?.message}
            disabled={busy}
          />
          {/* Fester Platz für AutoSave-Meldungen, damit die Buttons nicht springen. */}
          <div
            style={{ height: "3rem", display: "flex", alignItems: "center" }}
          >
            {saveError ? (
              <p role="alert" style={{ color: "#b00020", margin: 0 }}>
                Speichern fehlgeschlagen. Bitte erneut versuchen.
              </p>
            ) : busy ? (
              <p role="status" style={{ margin: 0 }}>
                Speichere Änderungen...
              </p>
            ) : status === "saved" && !dirty ? (
              <p
                role="status"
                style={{ color: "#2e7d32", fontWeight: 600, margin: 0 }}
              >
                ✔ Gespeichert
              </p>
            ) : null}
          </div>
          <div className="dialog-actions">
            <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy || deleting}>
              Löschen
            </button>
            <button
              type="button"
              onClick={() => void handleClose()}
              disabled={busy || deleting}
            >
              Schließen
            </button>
          </div>
        </form>
      </section>
      <DeleteConfirmationDialog
        open={confirmDelete}
        itemType="Ehrung"
        itemName={honor.honorName}
        deleting={deleting}
        error={deleteError}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
      <DiscardChangesDialog
        open={confirmDiscard}
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </div>
  );
}
