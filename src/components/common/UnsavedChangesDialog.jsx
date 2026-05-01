export default function UnsavedChangesDialog({ open, onStay, onLeave }) {
  if (!open) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>Ungespeicherte Änderungen</h2>

        <p>
          Es gibt Änderungen, die noch nicht gespeichert wurden oder bei denen
          das Speichern fehlgeschlagen ist.
        </p>

        <p>Möchtest du die Seite wirklich verlassen?</p>

        <div className="dialog-actions">
          <button type="button" onClick={onStay}>
            Hier bleiben
          </button>

          <button type="button" className="danger" onClick={onLeave}>
            Verlassen
          </button>
        </div>
      </div>
    </div>
  );
}