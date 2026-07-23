import FilterChip from "../../common/filters/FilterChip";
import FilterGroup from "../../common/filters/FilterGroup";
import RemovableFilterChip from "../../common/filters/RemovableFilterChip";

export default function BirthdayReportFilterPanel({
  mitgliedsstatusIds,
  stimmeIds,
  statuses,
  voices,
  hasActiveFilters,
  onToggleFilter,
  onResetFilters,
}) {
  const selectedStatuses = getSelectedOptions(mitgliedsstatusIds, statuses);

  const selectedVoices = getSelectedOptions(stimmeIds, voices);

  return (
    <section style={cardStyle}>
      <div style={topRowStyle}>
        <button
          type="button"
          className="secondary"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
        >
          Filter zurücksetzen
        </button>
      </div>

      <FilterGroup title="Status">
        {statuses.map((status) => (
          <FilterChip
            key={status.id}
            active={mitgliedsstatusIds.includes(String(status.id))}
            onClick={() => onToggleFilter("mitgliedsstatusId", status.id)}
          >
            {status.label}
          </FilterChip>
        ))}
      </FilterGroup>

      <FilterGroup title="Stimme">
        {voices.map((voice) => (
          <FilterChip
            key={voice.id}
            active={stimmeIds.includes(String(voice.id))}
            onClick={() => onToggleFilter("stimmeId", voice.id)}
          >
            {voice.label}
          </FilterChip>
        ))}
      </FilterGroup>

      {hasActiveFilters && (
        <div style={activeFilterSummaryStyle}>
          <strong>Aktive Filter:</strong>

          {selectedStatuses.map((status) => (
            <RemovableFilterChip
              key={`status-${status.id}`}
              onRemove={() => onToggleFilter("mitgliedsstatusId", status.id)}
            >
              Status: {status.label}
            </RemovableFilterChip>
          ))}

          {selectedVoices.map((voice) => (
            <RemovableFilterChip
              key={`voice-${voice.id}`}
              onRemove={() => onToggleFilter("stimmeId", voice.id)}
            >
              Stimme: {voice.label}
            </RemovableFilterChip>
          ))}
        </div>
      )}
    </section>
  );
}

function getSelectedOptions(selectedIds, options) {
  return selectedIds
    .map((id) => options.find((option) => String(option.id) === String(id)))
    .filter(Boolean);
}

const cardStyle = {
  background: "#fff",
  padding: "1rem",
  borderRadius: "12px",
  border: "1px solid #e2e5ea",
  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
};

const topRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
};

const activeFilterSummaryStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: "1px solid #edf0f3",
  color: "#555",
};
