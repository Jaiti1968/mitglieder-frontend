export default function MemberSection({
  title,
  isEditing,
  onEdit,
  errorMessage,
  isSaving,
  form,
  children,
}) {
  return (
    <section style={sectionStyle}>
      <SectionHeader title={title} isEditing={isEditing} onEdit={onEdit} />

      {isEditing ? (
        <>
          {errorMessage && <ErrorMessage message={errorMessage} />}
          {form}
          {isSaving && <p>Speichere...</p>}
        </>
      ) : (
        children
      )}
    </section>
  );
}

function SectionHeader({ title, isEditing, onEdit }) {
  return (
    <div style={sectionHeaderStyle}>
      <h2 style={{ margin: 0 }}>{title}</h2>

      {!isEditing && (
        <button type="button" onClick={onEdit}>
          Bearbeiten
        </button>
      )}
    </div>
  );
}

function ErrorMessage({ message }) {
  return <div className="error-box">{message}</div>;
}

const sectionStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  padding: "1.25rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1rem",
};