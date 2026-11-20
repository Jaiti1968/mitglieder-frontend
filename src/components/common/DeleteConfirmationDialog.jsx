import { useId } from "react";

export default function DeleteConfirmationDialog({
  open,
  itemType,
  itemName,
  onCancel,
  onConfirm,
  deleting = false,
  error = null,
}) {
  const id = useId();
  if (!open) return null;

  return (
    <div className="dialog-backdrop" style={{ zIndex: 1001 }}>
      <section
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        style={{ maxWidth: "440px" }}
      >
        <h2 id={`${id}-title`}>{itemType} löschen?</h2>
        <div id={`${id}-description`}>
          <p>
            Möchtest du {itemType === "Ehrung" ? "die" : "den"} {itemType} „
            {itemName}“ wirklich löschen?
          </p>
          <p>Dieser Vorgang kann nicht rückgängig gemacht werden.</p>
        </div>
        {error && (
          <p role="alert" style={{ color: "#b00020" }}>
            Löschen fehlgeschlagen. Bitte erneut versuchen.
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            autoFocus
          >
            Nein
          </button>
          <button
            type="button"
            className="primary"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Lösche..." : "Ja, löschen"}
          </button>
        </div>
      </section>
    </div>
  );
}
