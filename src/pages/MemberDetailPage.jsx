import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
import UnsavedChangesDialog from "../components/common/UnsavedChangesDialog";

import { useAutoSaveStatus } from "../hooks/useAutoSaveStatus";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";

export default function MemberDetailPage() {
  const { mitgliedsnummer } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("stammdaten");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState(null);

  const autoSaveStatus = useAutoSaveStatus();
  useUnsavedChanges(autoSaveStatus.hasUnsavedChanges);

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

  function updateMemberCache(partialData) {
    queryClient.setQueryData(["member", mitgliedsnummer], (current) => {
      if (!current) return current;

      return {
        ...current,
        ...partialData,
      };
    });

    queryClient.invalidateQueries({ queryKey: ["members"] });
  }

  const updateStammdatenMutation = useMutation({
    mutationFn: (stammdaten) => updateStammdaten(mitgliedsnummer, stammdaten),
    onSuccess: (_response, stammdaten) => {
      updateMemberCache({
        stammdaten: {
          ...(member?.stammdaten ?? {}),
          ...stammdaten,
        },
      });
    },
  });

  const updateKontaktMutation = useMutation({
    mutationFn: (kontakt) => updateKontakt(mitgliedsnummer, kontakt),
    onSuccess: (_response, kontakt) => {
      updateMemberCache({
        kontakt: {
          ...(member?.kontakt ?? {}),
          ...kontakt,
        },
      });
    },
  });

  const updateMitgliedschaftMutation = useMutation({
    mutationFn: (mitgliedschaft) =>
      updateMitgliedschaft(mitgliedsnummer, mitgliedschaft),
    onSuccess: (_response, mitgliedschaft) => {
      updateMemberCache({
        mitgliedschaft: {
          ...(member?.mitgliedschaft ?? {}),
          ...mitgliedschaft,
        },
      });
    },
  });

  function handleNavigate(event, target) {
    if (!autoSaveStatus.hasUnsavedChanges) return;

    event.preventDefault();
    setPendingNavigationTarget(target);
    setShowUnsavedDialog(true);
  }

  function handleStay() {
    setShowUnsavedDialog(false);
    setPendingNavigationTarget(null);
  }

  function handleLeave() {
    if (pendingNavigationTarget) {
      navigate(pendingNavigationTarget);
    }

    setShowUnsavedDialog(false);
    setPendingNavigationTarget(null);
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
  const backTarget = `/members${location.search}`;

  return (
    <main>
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onStay={handleStay}
        onLeave={handleLeave}
      />

      <Link
        to={backTarget}
        onClick={(event) => handleNavigate(event, backTarget)}
        style={{ display: "inline-block", marginBottom: "1rem" }}
      >
        ← Zurück zur Liste
      </Link>

      <MemberHeader member={member} />

      <div className="autosave-status">
        {autoSaveStatus.isSaving && <span>Speichere Änderungen...</span>}

        {autoSaveStatus.hasSaveError && (
          <ErrorBox message="Speichern fehlgeschlagen. Bitte die Seite nicht verlassen." />
        )}
      </div>

      <MemberTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "stammdaten" && (
        <MemberSection
          title="Stammdaten"
          isEditing={true}
          errorMessage={updateStammdatenMutation.error?.message}
          isSaving={updateStammdatenMutation.isPending}
          form={
            <MemberStammdatenForm
              stammdaten={stammdaten}
              onChange={(formData) =>
                updateStammdatenMutation.mutateAsync(formData)
              }
              onAutoSaveStart={() => autoSaveStatus.markSaving("stammdaten")}
              onAutoSaveSuccess={() => autoSaveStatus.markSaved("stammdaten")}
              onAutoSaveError={() => autoSaveStatus.markFailed("stammdaten")}
            />
          }
        />
      )}

      {activeTab === "kontakt" && (
        <MemberSection
          title="Kontakt"
          isEditing={true}
          errorMessage={updateKontaktMutation.error?.message}
          isSaving={updateKontaktMutation.isPending}
          form={
            <MemberContactForm
              kontakt={kontakt}
              onChange={(formData) =>
                updateKontaktMutation.mutateAsync(formData)
              }
              onAutoSaveStart={() => autoSaveStatus.markSaving("kontakt")}
              onAutoSaveSuccess={() => autoSaveStatus.markSaved("kontakt")}
              onAutoSaveError={() => autoSaveStatus.markFailed("kontakt")}
            />
          }
        />
      )}

      {activeTab === "mitgliedschaft" && (
        <MemberSection
          title="Mitgliedschaft"
          isEditing={true}
          errorMessage={updateMitgliedschaftMutation.error?.message}
          isSaving={updateMitgliedschaftMutation.isPending}
          form={
            <MemberMembershipForm
              mitgliedschaft={mitgliedschaft}
              statuses={statuses}
              voices={voices}
              onChange={(formData) =>
                updateMitgliedschaftMutation.mutateAsync(formData)
              }
              onAutoSaveStart={() =>
                autoSaveStatus.markSaving("mitgliedschaft")
              }
              onAutoSaveSuccess={() =>
                autoSaveStatus.markSaved("mitgliedschaft")
              }
              onAutoSaveError={() =>
                autoSaveStatus.markFailed("mitgliedschaft")
              }
            />
          }
        />
      )}
    </main>
  );
}