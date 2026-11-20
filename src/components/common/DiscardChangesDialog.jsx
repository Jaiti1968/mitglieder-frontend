import { useId } from "react";

export default function DiscardChangesDialog({
  open,
  onConfirm,
  onCancel,
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
        <h2 id={`${id}-title`}>Änderungen verwerfen?</h2>
        <div id={`${id}-description`}>
          <p>Die letzten Änderungen konnten nicht gespeichert werden.</p>
          <p>
            Möchtest du die ungespeicherten Änderungen verwerfen und den Dialog
            schließen?
          </p>
        </div>
        <div className="dialog-actions">
          <button type="button" onClick={onCancel} autoFocus>
            Nein
          </button>
          <button type="button" className="primary" onClick={onConfirm}>
            Ja
          </button>
        </div>
      </section>
    </div>
  );
}
