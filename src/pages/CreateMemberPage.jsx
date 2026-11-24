import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMember } from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import MemberStammdatenForm from "../components/members/details/MemberStammdatenForm";
import MemberContactForm from "../components/members/details/MemberContactForm";
import MemberMembershipForm from "../components/members/details/MemberMembershipForm";
import MemberTabs from "../components/members/details/MemberTabs";
import MemberSection from "../components/members/details/MemberSection";
import ErrorBox from "../components/common/ErrorBox";
import BackLink from "../components/common/BackLink";
import { validateMemberCreation } from "../utils/forms/validateMemberCreation";
import {
  createStammdatenPayload,
  createKontaktPayload,
  createMitgliedschaftPayload,
} from "../utils/forms/payloads";

export default function CreateMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("stammdaten");

  const [stammdatenBearbeitet, setStammdatenBearbeitet] = useState(false);

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
    mitgliedsstatusId: "4",
    stimmeId: "6",
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

  function handleStammdatenChange(values) {
    setStammdatenBearbeitet(true);
    setStammdaten(values);
  }

  const { stammdatenErrors, kontaktErrors, mitgliedschaftErrors, canCreate } =
    validateMemberCreation(stammdaten, kontakt, mitgliedschaft);

  const validationErrors = [
    ...stammdatenErrors,
    ...kontaktErrors,
    ...mitgliedschaftErrors,
  ];

  const fieldLabels = {
    vorname: {
      tab: "Stammdaten",
      label: stammdaten.personFirma ? "Firmenzusatz" : "Vorname",
    },
    nachname: {
      tab: "Stammdaten",
      label: stammdaten.personFirma ? "Firmenname" : "Nachname",
    },
    anrede: {
      tab: "Stammdaten",
      label: "Anrede",
    },
    akademischerTitel: {
      tab: "Stammdaten",
      label: "Akademischer Titel",
    },
    geburtsdatum: {
      tab: "Stammdaten",
      label: "Geburtsdatum",
    },
    plz: {
      tab: "Stammdaten",
      label: "PLZ",
    },
    ort: {
      tab: "Stammdaten",
      label: "Ort",
    },
    strasseHausNr: {
      tab: "Stammdaten",
      label: "Straße/Hausnummer",
    },
    email: {
      tab: "Kontakt",
      label: "E-Mail",
    },
    adresszusatz: {
      tab: "Kontakt",
      label: "Adresszusatz",
    },
    eintritt: {
      tab: "Mitgliedschaft",
      label: "Eintritt",
    },
    austritt: {
      tab: "Mitgliedschaft",
      label: "Austritt",
    },
    mitgliedsstatusId: {
      tab: "Mitgliedschaft",
      label: "Mitgliederstatus",
    },
    stimmeId: {
      tab: "Mitgliedschaft",
      label: "Stimme",
    },
  };

  const saveTooltip = validationErrors
    .map((error) => {
      const field = fieldLabels[error.field];

      return field
        ? `${field.tab} – ${field.label}: ${error.message}`
        : error.message;
    })
    .join("\n");

  function handleCreate() {
    createMemberMutation.reset();

    createMemberMutation.mutate({
      stammdaten: createStammdatenPayload(stammdaten),
      kontakt: createKontaktPayload(kontakt),
      mitgliedschaft: createMitgliedschaftPayload(mitgliedschaft),
    });
  }

  const showGlobalCreateError =
    createMemberMutation.error &&
    !createMemberMutation.error?.validationErrors?.length;

  return (
    <main>
      <BackLink to="/members">Zur Mitgliederliste</BackLink>

      <header style={headerStyle}>
        <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
          Mitglied anlegen
        </h1>

        <p style={{ margin: 0, color: "#555" }}>
          Die Eingaben werden automatisch übernommen. Zum Abschluss unten auf
          „Speichern“ klicken.
        </p>
      </header>

      <MemberTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        disabledTabs={["ehrungen", "datenschutz", "chorkleidung"]}
      />

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
              createMode={true}
              stammdatenBearbeitet={stammdatenBearbeitet}
              onChange={setStammdaten}
              onFormValuesChange={handleStammdatenChange}
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
              createMode={true}
              onChange={setKontakt}
              onFormValuesChange={setKontakt}
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
              createMode={true}
              onChange={setMitgliedschaft}
              onFormValuesChange={setMitgliedschaft}
              serverError={createMemberMutation.error}
              onClearServerError={() => createMemberMutation.reset()}
            />
          }
        />
      )}

      <section style={actionCardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
          }}
        >
          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/members")}
          >
            Abbrechen
          </button>

          <span
            title={!canCreate ? saveTooltip : ""}
            style={{ display: "inline-flex" }}
          >
            <button
              type="button"
              className="primary"
              onClick={handleCreate}
              disabled={!canCreate || createMemberMutation.isPending}
            >
              {createMemberMutation.isPending ? "Speichert..." : "Speichern"}
            </button>
          </span>
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
