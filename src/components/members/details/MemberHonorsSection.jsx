import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMemberHonors,
  createMemberHonor,
  updateMemberHonor,
  deleteMemberHonor,
} from "../../../api/honorApi";
import {
  formatIsoDateToGerman,
  isDateInFuture,
} from "../../../utils/forms/dateHelpers";
import ErrorBox from "../../common/ErrorBox";
import { useState } from "react";
import MemberHonorCreateDialog from "./MemberHonorCreateDialog";
import MemberHonorEditDialog from "./MemberHonorEditDialog";
import { getHonors } from "../../../api/lookupApi";

export default function MemberHonorsSection({
  mitgliedsnummer,
  canEdit = false,
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingHonor, setEditingHonor] = useState(null);
  const queryClient = useQueryClient();
  const {
    data: honors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["member", mitgliedsnummer, "honors"],
    queryFn: () => getMemberHonors(mitgliedsnummer),
    enabled: Boolean(mitgliedsnummer),
  });
  const {
    data: honorTypes = [],
    isLoading: honorTypesLoading,
    isError: honorTypesError,
  } = useQuery({
    queryKey: ["lookups", "honors"],
    queryFn: getHonors,
    enabled: canEdit,
  });

  const createHonorMutation = useMutation({
    mutationFn: (payload) => createMemberHonor(mitgliedsnummer, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["member", mitgliedsnummer, "honors"],
      });

      setShowCreateDialog(false);
    },
  });

  const updateHonorMutation = useMutation({
    mutationFn: ({ honorId, payload }) =>
      updateMemberHonor(mitgliedsnummer, honorId, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["member", mitgliedsnummer, "honors"],
      });
    },
  });

  const deleteHonorMutation = useMutation({
    mutationFn: (honorId) => deleteMemberHonor(mitgliedsnummer, honorId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["member", mitgliedsnummer, "honors"],
      });
      setEditingHonor(null);
    },
  });

  if (isLoading) {
    return <p>Lade Ehrungen...</p>;
  }

  if (isError) {
    return (
      <ErrorBox message={`Fehler beim Laden der Ehrungen: ${error.message}`} />
    );
  }

  return (
    <div>
      {canEdit && (
        <div style={{ marginBottom: "1rem" }}>
          <button type="button" onClick={() => setShowCreateDialog(true)}>
            Ehrung anlegen
          </button>
        </div>
      )}

      {honors.length === 0 ? (
        <p>Für dieses Mitglied sind keine Ehrungen erfasst.</p>
      ) : (
        <div className="honor-list">
          <div className="honor-list-header">
            <span>Ehrung</span>
            <span>Verliehen am</span>
          </div>

          {honors.map((honor) => {
            const germanDate = honor.honorDate
              ? formatIsoDateToGerman(honor.honorDate)
              : "–";

            const futureDate = honor.honorDate
              ? isDateInFuture(germanDate)
              : false;

            return (
              <div
                key={honor.honorId}
                className="member-card honor-card"
                role={canEdit ? "button" : undefined}
                tabIndex={canEdit ? 0 : undefined}
                onClick={canEdit ? () => setEditingHonor(honor) : undefined}
                onKeyDown={
                  canEdit
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setEditingHonor(honor);
                        }
                      }
                    : undefined
                }
              >
                <div className="honor-card-description">
                  <span className="honor-card-name">{honor.honorName}</span>

                  {futureDate && (
                    <span className="honor-card-future">
                      Zukünftiger Termin
                    </span>
                  )}
                </div>

                <span className="honor-card-date">{germanDate}</span>
              </div>
            );
          })}
        </div>
      )}

      <MemberHonorCreateDialog
        open={showCreateDialog}
        onClose={() => {
          createHonorMutation.reset();
          setShowCreateDialog(false);
        }}
        onSave={(payload) => createHonorMutation.mutateAsync(payload)}
        honorTypes={honorTypes}
        existingHonors={honors}
        honorTypesLoading={honorTypesLoading}
        honorTypesError={honorTypesError}
        saving={createHonorMutation.isPending}
        saveError={createHonorMutation.error}
      />

      <MemberHonorEditDialog
        open={editingHonor !== null}
        honor={editingHonor}
        onClose={() => {
          updateHonorMutation.reset();
          deleteHonorMutation.reset();
          setEditingHonor(null);
        }}
        onSave={(payload) =>
          updateHonorMutation.mutateAsync({
            honorId: editingHonor.honorId,
            payload,
          })
        }
        onDelete={() => deleteHonorMutation.mutateAsync(editingHonor.honorId)}
        deleting={deleteHonorMutation.isPending}
        deleteError={deleteHonorMutation.error}
        honorTypes={honorTypes}
        existingHonors={honors}
        honorTypesLoading={honorTypesLoading}
        honorTypesError={honorTypesError}
      />
    </div>
  );
}
