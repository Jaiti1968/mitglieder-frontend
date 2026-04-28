import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMember,
  updateKontakt,
  updateMitgliedschaft,
  updateStammdaten,
} from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import StammdatenForm from "../components/members/StammdatenForm";
import ContactForm from "../components/members/ContactForm";
import MembershipForm from "../components/members/MembershipForm";
import ErrorBox from "../components/common/ErrorBox";

export default function MemberDetailPage() {
  const { mitgliedsnummer } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("stammdaten");
  const [editingSection, setEditingSection] = useState(null);

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["member", mitgliedsnummer],
    queryFn: () => getMember(mitgliedsnummer),
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["member-statuses"],
    queryFn: getMemberStatuses,
  });

  const { data: voices = [] } = useQuery({
    queryKey: ["voices"],
    queryFn: getVoices,
  });

  const updateStammdatenMutation = useMutation({
    mutationFn: (stammdaten) => updateStammdaten(mitgliedsnummer, stammdaten),
    onSuccess: handleSaveSuccess,
  });

  const updateKontaktMutation = useMutation({
    mutationFn: (kontakt) => updateKontakt(mitgliedsnummer, kontakt),
    onSuccess: handleSaveSuccess,
  });

  const updateMitgliedschaftMutation = useMutation({
    mutationFn: (mitgliedschaft) =>
      updateMitgliedschaft(mitgliedsnummer, mitgliedschaft),
    onSuccess: handleSaveSuccess,
  });

  function handleSaveSuccess() {
    queryClient.invalidateQueries({ queryKey: ["member", mitgliedsnummer] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    setEditingSection(null);
  }

  function switchTab(tab) {
    setActiveTab(tab);
    setEditingSection(null);
  }

  if (isLoading) return <p>Lade Mitglied...</p>;

  if (isError) {
    return (
      <main>
        <ErrorBox message={`Fehler beim Laden: ${error.message}`} />
      </main>
    );
  }

  const stammdaten = member.stammdaten ?? {};
  const kontakt = member.kontakt ?? {};
  const mitgliedschaft = member.mitgliedschaft ?? {};

  return (
    <main>
      <Link
        to={`/members${location.search}`}
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        ← Zurück zur Liste
      </Link>

      <header style={headerStyle}>
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
          {stammdaten.vorname} {stammdaten.nachname}
        </h1>

        <p style={{ margin: 0, color: "#555" }}>
          Mitgliedsnummer: <strong>{member.mitgliedsnummer}</strong>
        </p>

        <p style={{ marginTop: "0.5rem", color: "#555" }}>
          {mitgliedschaft.mitgliedsstatus && (
            <span>{mitgliedschaft.mitgliedsstatus}</span>
          )}
          {mitgliedschaft.stimme && <span> · {mitgliedschaft.stimme}</span>}
          {mitgliedschaft.kammerchor && <span> · Kammerchor</span>}
        </p>
      </header>

      <nav style={tabsStyle}>
        <TabButton
          active={activeTab === "stammdaten"}
          onClick={() => switchTab("stammdaten")}
        >
          Stammdaten
        </TabButton>

        <TabButton
          active={activeTab === "kontakt"}
          onClick={() => switchTab("kontakt")}
        >
          Kontakt
        </TabButton>

        <TabButton
          active={activeTab === "mitgliedschaft"}
          onClick={() => switchTab("mitgliedschaft")}
        >
          Mitgliedschaft
        </TabButton>
      </nav>

      <section style={sectionStyle}>
        {activeTab === "stammdaten" && (
          <>
            <SectionHeader
              title="Stammdaten"
              isEditing={editingSection === "stammdaten"}
              onEdit={() => setEditingSection("stammdaten")}
            />

            {editingSection === "stammdaten" ? (
              <>
                <ErrorBox message={updateStammdatenMutation.error?.message} />

                <StammdatenForm
                  stammdaten={stammdaten}
                  onSave={(formData) =>
                    updateStammdatenMutation.mutate(formData)
                  }
                  onCancel={() => setEditingSection(null)}
                />

                {updateStammdatenMutation.isPending && <p>Speichere...</p>}
              </>
            ) : (
              <>
                <Field label="Anrede" value={stammdaten.anrede} />
                <Field
                  label="Akademischer Titel"
                  value={stammdaten.akademischerTitel}
                />
                <Field label="Vorname" value={stammdaten.vorname} />
                <Field label="Nachname" value={stammdaten.nachname} />
                <Field label="Geburtsdatum" value={stammdaten.geburtsdatum} />
                <Field
                  label="Adresse"
                  value={`${stammdaten.strasseHausNr ?? ""}, ${
                    stammdaten.plz ?? ""
                  } ${stammdaten.ort ?? ""}`}
                />
              </>
            )}
          </>
        )}

        {activeTab === "kontakt" && (
          <>
            <SectionHeader
              title="Kontakt"
              isEditing={editingSection === "kontakt"}
              onEdit={() => setEditingSection("kontakt")}
            />

            {editingSection === "kontakt" ? (
              <>
                <ErrorBox message={updateKontaktMutation.error?.message} />

                <ContactForm
                  kontakt={kontakt}
                  onSave={(formData) => updateKontaktMutation.mutate(formData)}
                  onCancel={() => setEditingSection(null)}
                />

                {updateKontaktMutation.isPending && <p>Speichere...</p>}
              </>
            ) : (
              <>
                <Field label="Telefon privat" value={kontakt.telefonPrivat} />
                <Field
                  label="Telefon geschäftlich"
                  value={kontakt.telefonGeschaeftlich}
                />
                <Field label="Mobiltelefon" value={kontakt.mobiltelefon} />
                <Field label="E-Mail" value={kontakt.email} />
                <Field label="Adresszusatz" value={kontakt.adresszusatz} />
                <Field label="Briefanrede" value={kontakt.briefanrede} />
              </>
            )}
          </>
        )}

        {activeTab === "mitgliedschaft" && (
          <>
            <SectionHeader
              title="Mitgliedschaft"
              isEditing={editingSection === "mitgliedschaft"}
              onEdit={() => setEditingSection("mitgliedschaft")}
            />

            {editingSection === "mitgliedschaft" ? (
              <>
                <ErrorBox
                  message={updateMitgliedschaftMutation.error?.message}
                />

                <MembershipForm
                  mitgliedschaft={mitgliedschaft}
                  statuses={statuses}
                  voices={voices}
                  onSave={(formData) =>
                    updateMitgliedschaftMutation.mutate(formData)
                  }
                  onCancel={() => setEditingSection(null)}
                />

                {updateMitgliedschaftMutation.isPending && (
                  <p>Speichere...</p>
                )}
              </>
            ) : (
              <>
                <Field label="Eintritt" value={mitgliedschaft.eintritt} />
                <Field label="Austritt" value={mitgliedschaft.austritt} />
                <Field label="Status" value={mitgliedschaft.mitgliedsstatus} />
                <Field label="Stimme" value={mitgliedschaft.stimme} />
                <Field
                  label="Kammerchor"
                  value={mitgliedschaft.kammerchor ? "Ja" : "Nein"}
                />
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? activeTabButtonStyle : tabButtonStyle}
    >
      {children}
    </button>
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

function Field({ label, value }) {
  return (
    <div style={fieldStyle}>
      <strong>{label}</strong>
      <span style={{ color: value ? "inherit" : "#999" }}>{value || "—"}</span>
    </div>
  );
}

const headerStyle = {
  marginBottom: "1.5rem",
  padding: "1.25rem",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const tabsStyle = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

const tabButtonStyle = {
  backgroundColor: "#ffffff",
  color: "#333",
  border: "1px solid #ccc",
};

const activeTabButtonStyle = {
  backgroundColor: "#1f5fbf",
  color: "#ffffff",
  border: "1px solid #1f5fbf",
};

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

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "1rem",
  padding: "0.55rem 0",
  borderBottom: "1px solid #edf0f3",
};