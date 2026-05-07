import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import MemberStammdatenForm from "../components/members/details/MemberStammdatenForm";
import MemberContactForm from "../components/members/details/MemberContactForm";
import MemberMembershipForm from "../components/members/details/MemberMembershipForm";
import MemberTabs from "../components/members/details/MemberTabs";
import MemberSection from "../components/members/details/MemberSection";
import ErrorBox from "../components/common/ErrorBox";

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("stammdaten");

  const [stammdaten, setStammdaten] = useState({
    personFirma: false,
    anrede: "Herr",
    akademischerTitel: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    plz: "",
    ort: "",
    strasseHausNr: "",
  });

  const [kontakt, setKontakt] = useState({
    telefonPrivat: "",
    telefonGeschaeftlich: "",
    mobiltelefon: "",
    email: "",
    adresszusatz: "",
    briefanrede: "",
  });

  const [mitgliedschaft, setMitgliedschaft] = useState({
    eintritt: "",
    austritt: "",
    mitgliedsstatusId: "",
    stimmeId: "",
    kammerchor: false,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["member-statuses"],
    queryFn: getMemberStatuses,
  });

  const { data: voices = [] } = useQuery({
    queryKey: ["voices"],
    queryFn: getVoices,
  });

  const createMemberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: (createdMember) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      navigate(`/members/${createdMember.mitgliedsnummer}`);
    },
  });

  const isFirma = stammdaten.personFirma === true;

  const vornameVorhanden = stammdaten.vorname?.trim().length > 0;
  const nachnameVorhanden = stammdaten.nachname?.trim().length > 0;

  const canCreate = isFirma
    ? nachnameVorhanden
    : vornameVorhanden && nachnameVorhanden;

  function handleCreate() {
    createMemberMutation.reset();

    createMemberMutation.mutate({
      stammdaten: normalizeStammdaten(stammdaten),
      kontakt: normalizeKontakt(kontakt),
      mitgliedschaft: normalizeMitgliedschaft(mitgliedschaft),
    });
  }

  const showGlobalCreateError =
    createMemberMutation.error &&
    !createMemberMutation.error?.validationErrors?.length;

  return (
    <main>
      <Link
        to="/members"
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        ← Zurück zur Liste
      </Link>

      <header style={headerStyle}>
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
          Neues Mitglied anlegen
        </h1>

        <p style={{ margin: 0, color: "#555" }}>
          Die Eingaben werden automatisch übernommen. Zum Abschluss unten auf
          „Mitglied anlegen“ klicken.
        </p>
      </header>

      <MemberTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {showGlobalCreateError && (
        <ErrorBox message={createMemberMutation.error.message} />
      )}

      {activeTab === "stammdaten" && (
        <MemberSection
          title="Stammdaten"
          isEditing={true}
          onEdit={() => {}}
          errorMessage={null}
          isSaving={false}
          form={
            <MemberStammdatenForm
              stammdaten={stammdaten}
              onChange={setStammdaten}
              serverError={createMemberMutation.error}
              onClearServerError={() => createMemberMutation.reset()}
            />
          }
        />
      )}

      {activeTab === "kontakt" && (
        <MemberSection
          title="Kontakt"
          isEditing={true}
          onEdit={() => {}}
          errorMessage={null}
          isSaving={false}
          form={
            <MemberContactForm
              kontakt={kontakt}
              onChange={setKontakt}
              serverError={createMemberMutation.error}
              onClearServerError={() => createMemberMutation.reset()}
            />
          }
        />
      )}

      {activeTab === "mitgliedschaft" && (
        <MemberSection
          title="Mitgliedschaft"
          isEditing={true}
          onEdit={() => {}}
          errorMessage={null}
          isSaving={false}
          form={
            <MemberMembershipForm
              mitgliedschaft={mitgliedschaft}
              statuses={statuses}
              voices={voices}
              onChange={setMitgliedschaft}
              serverError={createMemberMutation.error}
              onClearServerError={() => createMemberMutation.reset()}
            />
          }
        />
      )}

      <section style={actionCardStyle}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate || createMemberMutation.isPending}
          >
            {createMemberMutation.isPending ? "Lege an..." : "Mitglied anlegen"}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/members")}
          >
            Abbrechen
          </button>
        </div>

        {!canCreate && (
          <p style={hintStyle}>
            {isFirma
              ? "Bitte mindestens den Firmennamen eingeben."
              : "Bitte Vorname und Nachname eingeben."}
          </p>
        )}
      </section>
    </main>
  );
}

function normalizeStammdaten(stammdaten) {
  const isFirma = stammdaten.personFirma === true;

  return {
    personFirma: isFirma,
    anrede: isFirma ? "" : (stammdaten.anrede ?? ""),
    akademischerTitel: isFirma ? "" : (stammdaten.akademischerTitel ?? ""),
    vorname: stammdaten.vorname ?? "",
    nachname: stammdaten.nachname ?? "",
    geburtsdatum: isFirma ? "" : (stammdaten.geburtsdatum ?? ""),
    plz: stammdaten.plz ?? "",
    ort: stammdaten.ort ?? "",
    strasseHausNr: stammdaten.strasseHausNr ?? "",
  };
}

function normalizeKontakt(kontakt) {
  return {
    telefonPrivat: kontakt.telefonPrivat ?? "",
    telefonGeschaeftlich: kontakt.telefonGeschaeftlich ?? "",
    mobiltelefon: kontakt.mobiltelefon ?? "",
    email: kontakt.email ?? "",
    adresszusatz: kontakt.adresszusatz ?? "",
    briefanrede: kontakt.briefanrede ?? "",
  };
}

function normalizeMitgliedschaft(mitgliedschaft) {
  return {
    eintritt: mitgliedschaft.eintritt || null,
    austritt: mitgliedschaft.austritt || null,
    mitgliedsstatusId: mitgliedschaft.mitgliedsstatusId
      ? Number(mitgliedschaft.mitgliedsstatusId)
      : null,
    stimmeId: mitgliedschaft.stimmeId ? Number(mitgliedschaft.stimmeId) : null,
    kammerchor: mitgliedschaft.kammerchor === true,
  };
}

const headerStyle = {
  marginBottom: "1.5rem",
  padding: "1.25rem",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const actionCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  padding: "1.25rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const hintStyle = {
  marginBottom: 0,
  marginTop: "0.75rem",
  color: "#666",
  fontSize: "0.9rem",
};
