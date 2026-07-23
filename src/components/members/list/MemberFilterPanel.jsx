import FilterChip from "../../common/filters/FilterChip";
import FilterGroup from "../../common/filters/FilterGroup";
import RemovableFilterChip from "../../common/filters/RemovableFilterChip";

export default function MemberFilterPanel({
  search,
  statusIds,
  stimmeIds,
  statuses,
  voices,
  hasActiveFilters,
  onSearchChange,
  onToggleFilter,
  onResetFilters,
}) {
  return (
    <section style={cardStyle}>
      <div style={filterTopRowStyle}>
        <input
          placeholder="Suche..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          style={{ width: "100%" }}
        />

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
            active={statusIds.includes(String(status.id))}
            onClick={() => onToggleFilter("statusId", status.id)}
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
        <ActiveFilterSummary
          search={search}
          statusIds={statusIds}
          stimmeIds={stimmeIds}
          statuses={statuses}
          voices={voices}
          onRemoveSearch={() => onSearchChange("")}
          onRemoveStatus={(id) => onToggleFilter("statusId", id)}
          onRemoveVoice={(id) => onToggleFilter("stimmeId", id)}
        />
      )}
    </section>
  );
}

function ActiveFilterSummary({
  search,
  statusIds,
  stimmeIds,
  statuses,
  voices,
  onRemoveSearch,
  onRemoveStatus,
  onRemoveVoice,
}) {
  const selectedStatuses = getSelectedOptions(statusIds, statuses);
  const selectedVoices = getSelectedOptions(stimmeIds, voices);

  return (
    <div style={activeFilterSummaryStyle}>
      <strong>Aktive Filter:</strong>

      {search && (
        <RemovableFilterChip onRemove={onRemoveSearch}>
          Suche: „{search}“
        </RemovableFilterChip>
      )}

      {selectedStatuses.map((status) => (
        <RemovableFilterChip
          key={`status-${status.id}`}
          onRemove={() => onRemoveStatus(status.id)}
        >
          Status: {status.label}
        </RemovableFilterChip>
      ))}

      {selectedVoices.map((voice) => (
        <RemovableFilterChip
          key={`voice-${voice.id}`}
          onRemove={() => onRemoveVoice(voice.id)}
        >
          Stimme: {voice.label}
        </RemovableFilterChip>
      ))}
    </div>
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

const filterTopRowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "1rem",
  alignItems: "center",
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
