import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import DateField from "../../forms/DateField";
import SelectField from "../../forms/SelectField";
import { validateEhrung } from "../../../utils/forms/validators";
import { createEhrungPayload } from "../../../utils/forms/payloads";

export default function MemberHonorCreateDialog({
  open,
  onClose,
  onSave,
  honorTypes = [],
  existingHonors = [],
  honorTypesLoading = false,
  honorTypesError = false,
  saving = false,
  saveError = null,
}) {
  const {
    register,
    control,
    reset,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      honorTypeId: "",
      honorDate: "",
    },
  });

  const values = useWatch({ control });

  const validationErrors = validateEhrung(values, existingHonors);

  const isFormValid =
    !honorTypesLoading &&
    !honorTypesError &&
    honorTypes.length > 0 &&
    validationErrors.length === 0;

  const fieldLabels = {
    honorTypeId: "Ehrungsart",
    honorDate: "Ehrungsdatum",
  };

  const saveTooltip = honorTypesLoading
    ? "Ehrungsart: Ehrungsarten werden geladen."
    : honorTypesError || honorTypes.length === 0
      ? "Ehrungsart: Es sind keine Ehrungsarten verfügbar."
      : validationErrors
          .map(({ field, message }) => {
            const label = fieldLabels[field];

            return label ? `${label}: ${message}` : message;
          })
          .join("\n");

  useEffect(() => {
    if (!open || !isDirty) return;

    const timeoutId = setTimeout(() => {
      const currentErrors = validateEhrung(values, existingHonors);

      clearErrors();

      currentErrors.forEach(({ field, message }) => {
        setError(field, {
          type: "client",
          message,
        });
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [open, isDirty, values, existingHonors, clearErrors, setError]);

  async function handleSave(values) {
    clearErrors();

    const validationErrors = validateEhrung(values, existingHonors);

    if (validationErrors.length > 0) {
      validationErrors.forEach(({ field, message }) => {
        setError(field, { type: "manual", message });
      });
      return;
    }

    if (saving || honorTypesLoading || honorTypesError) {
      return;
    }

    const payload = createEhrungPayload(values);

    try {
      await onSave(payload);
    } catch {
      // Der Fehler wird über saveError im Dialog angezeigt.
    }
  }

  useEffect(() => {
    if (open) {
      reset({
        honorTypeId: "",
        honorDate: "",
      });
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open || saving) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, saving]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="honor-create-title"
        style={{
          maxWidth: "600px",
        }}
      >
        <h2 id="honor-create-title">Ehrung anlegen</h2>

        <form noValidate onSubmit={handleSubmit(handleSave)}>
          <SelectField
            label="Ehrungsart"
            required
            options={honorTypes}
            error={errors.honorTypeId?.message}
            disabled={honorTypesLoading || honorTypesError || saving}
            {...register("honorTypeId")}
          />

          {honorTypesLoading && (
            <p role="status">Ehrungsarten werden geladen...</p>
          )}

          {honorTypesError && (
            <p role="alert" style={{ color: "#b00020" }}>
              Die Ehrungsarten konnten nicht geladen werden. Bitte versuche es
              später erneut.
            </p>
          )}

          <DateField
            name="honorDate"
            control={control}
            label="Ehrungsdatum"
            error={errors.honorDate?.message}
            disabled={saving}
          />

          {saveError && (
            <p role="alert" style={{ color: "#b00020" }}>
              Die Ehrung konnte nicht gespeichert werden. Bitte versuche es
              erneut.
            </p>
          )}

          <div className="dialog-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Abbrechen
            </button>

            <span
              title={!isFormValid && !saving ? saveTooltip : ""}
              style={{ display: "inline-flex" }}
            >
              <button
                type="submit"
                className="primary"
                disabled={!isFormValid || saving}
              >
                {saving ? "Speichert..." : "Speichern"}
              </button>
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
