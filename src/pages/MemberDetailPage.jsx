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
import MemberStammdatenForm from "../components/members/details/MemberStammdatenForm";
import MemberContactForm from "../components/members/details/MemberContactForm";
import MemberMembershipForm from "../components/members/details/MemberMembershipForm";
import MemberHeader from "../components/members/details/MemberHeader";
import MemberSection from "../components/members/details/MemberSection";
import MemberTabs from "../components/members/details/MemberTabs";
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

      <MemberHeader member={member} />

      <MemberTabs activeTab={activeTab} onTabChange={switchTab} />

      {activeTab === "stammdaten" && (
        <MemberSection
          title="Stammdaten"
          isEditing={editingSection === "stammdaten"}
          onEdit={() => setEditingSection("stammdaten")}
          errorMessage={updateStammdatenMutation.error?.message}
          isSaving={updateStammdatenMutation.isPending}
          form={
            <MemberStammdatenForm
              stammdaten={stammdaten}
              onSave={(formData) => updateStammdatenMutation.mutate(formData)}
              onCancel={() => setEditingSection(null)}
            />
          }
        >
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
        </MemberSection>
      )}

      {activeTab === "kontakt" && (
        <MemberSection
          title="Kontakt"
          isEditing={editingSection === "kontakt"}
          onEdit={() => setEditingSection("kontakt")}
          errorMessage={updateKontaktMutation.error?.message}
          isSaving={updateKontaktMutation.isPending}
          form={
            <MemberContactForm
              kontakt={kontakt}
              onSave={(formData) => updateKontaktMutation.mutate(formData)}
              onCancel={() => setEditingSection(null)}
            />
          }
        >
          <Field label="Telefon privat" value={kontakt.telefonPrivat} />
          <Field
            label="Telefon geschäftlich"
            value={kontakt.telefonGeschaeftlich}
          />
          <Field label="Mobiltelefon" value={kontakt.mobiltelefon} />
          <Field label="E-Mail" value={kontakt.email} />
          <Field label="Adresszusatz" value={kontakt.adresszusatz} />
          <Field label="Briefanrede" value={kontakt.briefanrede} />
        </MemberSection>
      )}

      {activeTab === "mitgliedschaft" && (
        <MemberSection
          title="Mitgliedschaft"
          isEditing={editingSection === "mitgliedschaft"}
          onEdit={() => setEditingSection("mitgliedschaft")}
          errorMessage={updateMitgliedschaftMutation.error?.message}
          isSaving={updateMitgliedschaftMutation.isPending}
          form={
            <MemberMembershipForm
              mitgliedschaft={mitgliedschaft}
              statuses={statuses}
              voices={voices}
              onSave={(formData) =>
                updateMitgliedschaftMutation.mutate(formData)
              }
              onCancel={() => setEditingSection(null)}
            />
          }
        >
          <Field label="Eintritt" value={mitgliedschaft.eintritt} />
          <Field label="Austritt" value={mitgliedschaft.austritt} />
          <Field label="Status" value={mitgliedschaft.mitgliedsstatus} />
          <Field label="Stimme" value={mitgliedschaft.stimme} />
          <Field
            label="Kammerchor"
            value={mitgliedschaft.kammerchor ? "Ja" : "Nein"}
          />
        </MemberSection>
      )}
    </main>
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

const fieldStyle = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: "1rem",
  padding: "0.55rem 0",
  borderBottom: "1px solid #edf0f3",
};