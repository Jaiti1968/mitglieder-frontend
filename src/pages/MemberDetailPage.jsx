import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getChorkleidung,
  getDatenschutz,
  getMember,
  updateChorkleidung,
  updateDatenschutz,
  updateKontakt,
  updateMitgliedschaft,
  updateStammdaten,
} from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import useAuth from "../auth/useAuth";

import MemberStammdatenForm from "../components/members/details/MemberStammdatenForm";
import MemberContactForm from "../components/members/details/MemberContactForm";
import MemberMembershipForm from "../components/members/details/MemberMembershipForm";
import MemberDatenschutzForm from "../components/members/details/MemberDatenschutzForm";
import MemberChorkleidungForm from "../components/members/details/MemberChorkleidungForm";
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
  const { user } = useAuth();

  const canEdit = user?.role === "ADMIN" || user?.role === "EDITOR";

  const [activeTab, setActiveTab] = useState("stammdaten");
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState(null);

  const autoSaveStatus = useAutoSaveStatus();
  useUnsavedChanges(canEdit && autoSaveStatus.hasUnsavedChanges);

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["member", mitgliedsnummer],
    queryFn: () => getMember(mitgliedsnummer),
  });

  const {
    data: datenschutz = {},
    isLoading: isDatenschutzLoading,
    isError: isDatenschutzError,
    error: datenschutzLoadError,
  } = useQuery({
    queryKey: ["member", mitgliedsnummer, "datenschutz"],
    queryFn: () => getDatenschutz(mitgliedsnummer),
    enabled: activeTab === "datenschutz",
  });

  const {
    data: chorkleidung = {},
    isLoading: isChorkleidungLoading,
    isError: isChorkleidungError,
    error: chorkleidungLoadError,
  } = useQuery({
    queryKey: ["member", mitgliedsnummer, "chorkleidung"],
    queryFn: () => getChorkleidung(mitgliedsnummer),
    enabled: activeTab === "chorkleidung",
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

  const updateDatenschutzMutation = useMutation({
    mutationFn: (formData) => updateDatenschutz(mitgliedsnummer, formData),
    onSuccess: (_response, formData) => {
      queryClient.setQueryData(
        ["member", mitgliedsnummer, "datenschutz"],
        (current) => ({
          ...(current ?? {}),
          ...formData,
        }),
      );
    },
  });

  const updateChorkleidungMutation = useMutation({
    mutationFn: (formData) => updateChorkleidung(mitgliedsnummer, formData),
    onSuccess: (_response, formData) => {
      queryClient.setQueryData(
        ["member", mitgliedsnummer, "chorkleidung"],
        (current) => ({
          ...(current ?? {}),
          ...formData,
        }),
      );
    },
  });

  function handleNavigate(event, target) {
    if (!canEdit || !autoSaveStatus.hasUnsavedChanges) return;

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

  const savedStyle = {
    color: "#2e7d32",
    fontWeight: 600,
  };

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

      {canEdit && (
        <div className="autosave-status">
          {autoSaveStatus.isSaving && <span>Speichere Änderungen...</span>}

          {!autoSaveStatus.isSaving && autoSaveStatus.hasSaved && (
            <span style={savedStyle}>✔ Gespeichert</span>
          )}

          {autoSaveStatus.hasSaveError && (
            <ErrorBox message="Speichern fehlgeschlagen. Bitte die Seite nicht verlassen." />
          )}
        </div>
      )}

      {!canEdit && (
        <p style={readOnlyNoticeStyle}>
          Nur-Lese-Modus: Du kannst die Daten ansehen, aber nicht bearbeiten.
        </p>
      )}

      <MemberTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "stammdaten" && (
        <MemberSection
          title="Stammdaten"
          isEditing={true}
          errorMessage={
            canEdit && updateStammdatenMutation.error?.validationErrors?.length
              ? null
              : canEdit
                ? updateStammdatenMutation.error?.message
                : null
          }
          isSaving={canEdit && updateStammdatenMutation.isPending}
          form={
            <MemberStammdatenForm
              stammdaten={stammdaten}
              readOnly={!canEdit}
              onChange={(formData) =>
                canEdit
                  ? updateStammdatenMutation.mutateAsync(formData)
                  : Promise.resolve()
              }
              onAutoSaveStart={() =>
                canEdit && autoSaveStatus.markSaving("stammdaten")
              }
              onAutoSaveSuccess={() =>
                canEdit && autoSaveStatus.markSaved("stammdaten")
              }
              onAutoSaveError={() =>
                canEdit && autoSaveStatus.markFailed("stammdaten")
              }
              serverError={canEdit ? updateStammdatenMutation.error : null}
              onClearServerError={() =>
                canEdit && updateStammdatenMutation.reset()
              }
            />
          }
        />
      )}

      {activeTab === "kontakt" && (
        <MemberSection
          title="Kontakt"
          isEditing={true}
          errorMessage={
            canEdit && updateKontaktMutation.error?.validationErrors?.length
              ? null
              : canEdit
                ? updateKontaktMutation.error?.message
                : null
          }
          isSaving={canEdit && updateKontaktMutation.isPending}
          form={
            <MemberContactForm
              kontakt={kontakt}
              readOnly={!canEdit}
              onChange={(formData) =>
                canEdit
                  ? updateKontaktMutation.mutateAsync(formData)
                  : Promise.resolve()
              }
              onAutoSaveStart={() =>
                canEdit && autoSaveStatus.markSaving("kontakt")
              }
              onAutoSaveSuccess={() =>
                canEdit && autoSaveStatus.markSaved("kontakt")
              }
              onAutoSaveError={() =>
                canEdit && autoSaveStatus.markFailed("kontakt")
              }
              serverError={canEdit ? updateKontaktMutation.error : null}
              onClearServerError={() =>
                canEdit && updateKontaktMutation.reset()
              }
            />
          }
        />
      )}

      {activeTab === "mitgliedschaft" && (
        <MemberSection
          title="Mitgliedschaft"
          isEditing={true}
          errorMessage={
            canEdit &&
            updateMitgliedschaftMutation.error?.validationErrors?.length
              ? null
              : canEdit
                ? updateMitgliedschaftMutation.error?.message
                : null
          }
          isSaving={canEdit && updateMitgliedschaftMutation.isPending}
          form={
            <MemberMembershipForm
              mitgliedschaft={mitgliedschaft}
              statuses={statuses}
              voices={voices}
              readOnly={!canEdit}
              onChange={(formData) =>
                canEdit
                  ? updateMitgliedschaftMutation.mutateAsync(formData)
                  : Promise.resolve()
              }
              onAutoSaveStart={() =>
                canEdit && autoSaveStatus.markSaving("mitgliedschaft")
              }
              onAutoSaveSuccess={() =>
                canEdit && autoSaveStatus.markSaved("mitgliedschaft")
              }
              onAutoSaveError={() =>
                canEdit && autoSaveStatus.markFailed("mitgliedschaft")
              }
              serverError={canEdit ? updateMitgliedschaftMutation.error : null}
              onClearServerError={() =>
                canEdit && updateMitgliedschaftMutation.reset()
              }
            />
          }
        />
      )}

      {activeTab === "datenschutz" && (
        <MemberSection
          title="Datenschutz"
          isEditing={true}
          errorMessage={
            canEdit && updateDatenschutzMutation.error?.validationErrors?.length
              ? null
              : canEdit
                ? updateDatenschutzMutation.error?.message
                : null
          }
          isSaving={canEdit && updateDatenschutzMutation.isPending}
          form={
            <>
              {isDatenschutzLoading && <p>Lade Datenschutz...</p>}

              {isDatenschutzError && (
                <ErrorBox
                  message={`Fehler beim Laden Datenschutz: ${datenschutzLoadError.message}`}
                />
              )}

              {!isDatenschutzLoading && !isDatenschutzError && (
                <MemberDatenschutzForm
                  datenschutz={datenschutz}
                  readOnly={!canEdit}
                  onChange={(formData) =>
                    canEdit
                      ? updateDatenschutzMutation.mutateAsync(formData)
                      : Promise.resolve()
                  }
                  onAutoSaveStart={() =>
                    canEdit && autoSaveStatus.markSaving("datenschutz")
                  }
                  onAutoSaveSuccess={() =>
                    canEdit && autoSaveStatus.markSaved("datenschutz")
                  }
                  onAutoSaveError={() =>
                    canEdit && autoSaveStatus.markFailed("datenschutz")
                  }
                  serverError={canEdit ? updateDatenschutzMutation.error : null}
                  onClearServerError={() =>
                    canEdit && updateDatenschutzMutation.reset()
                  }
                />
              )}
            </>
          }
        />
      )}

      {activeTab === "chorkleidung" && (
        <MemberSection
          title="Chorkleidung"
          isEditing={true}
          errorMessage={
            canEdit &&
            updateChorkleidungMutation.error?.validationErrors?.length
              ? null
              : canEdit
                ? updateChorkleidungMutation.error?.message
                : null
          }
          isSaving={canEdit && updateChorkleidungMutation.isPending}
          form={
            <>
              {isChorkleidungLoading && <p>Lade Chorkleidung...</p>}

              {isChorkleidungError && (
                <ErrorBox
                  message={`Fehler beim Laden Chorkleidung: ${chorkleidungLoadError.message}`}
                />
              )}

              {!isChorkleidungLoading && !isChorkleidungError && (
                <MemberChorkleidungForm
                  chorkleidung={chorkleidung}
                  readOnly={!canEdit}
                  onChange={(formData) =>
                    canEdit
                      ? updateChorkleidungMutation.mutateAsync(formData)
                      : Promise.resolve()
                  }
                  onAutoSaveStart={() =>
                    canEdit && autoSaveStatus.markSaving("chorkleidung")
                  }
                  onAutoSaveSuccess={() =>
                    canEdit && autoSaveStatus.markSaved("chorkleidung")
                  }
                  onAutoSaveError={() =>
                    canEdit && autoSaveStatus.markFailed("chorkleidung")
                  }
                  serverError={
                    canEdit ? updateChorkleidungMutation.error : null
                  }
                  onClearServerError={() =>
                    canEdit && updateChorkleidungMutation.reset()
                  }
                />
              )}
            </>
          }
        />
      )}
    </main>
  );
}

const readOnlyNoticeStyle = {
  margin: "0.75rem 0 1rem",
  padding: "0.75rem 1rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#f9fafb",
  color: "#374151",
};
