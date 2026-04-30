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

  const [mitgliedschaft, setMitgliedschaft] = useState({});

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

  const nachnameVorhanden = stammdaten.nachname?.trim().length > 0;

  function handleCreate() {
    createMemberMutation.mutate({
      stammdaten,
      kontakt,
      mitgliedschaft,
    });
  }

  return (
    <main>
      <Link to="/members" style={{ display: "inline-block", marginBottom: "1rem" }}>
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

      <ErrorBox message={createMemberMutation.error?.message} />

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
            />
          }
        />
      )}

      <section style={actionCardStyle}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!nachnameVorhanden || createMemberMutation.isPending}
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
      </section>
    </main>
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

const actionCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  padding: "1.25rem",
  marginBottom: "1rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};