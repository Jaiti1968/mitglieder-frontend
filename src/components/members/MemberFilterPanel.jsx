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
        />
      )}
    </section>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ marginTop: "1rem" }}>
      <strong>{title}</strong>
      <div style={chipContainerStyle}>{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? activeChipStyle : chipStyle}
    >
      {children}
    </button>
  );
}

function ActiveFilterSummary({ search, statusIds, stimmeIds, statuses, voices }) {
  const selectedStatuses = getSelectedLabels(statusIds, statuses);
  const selectedVoices = getSelectedLabels(stimmeIds, voices);

  return (
    <div style={activeFilterSummaryStyle}>
      <strong>Aktive Filter:</strong>

      {search && <span>Suche: „{search}“</span>}

      {selectedStatuses.length > 0 && (
        <span>Status: {selectedStatuses.join(", ")}</span>
      )}

      {selectedVoices.length > 0 && (
        <span>Stimme: {selectedVoices.join(", ")}</span>
      )}
    </div>
  );
}

function getSelectedLabels(selectedIds, options) {
  return selectedIds
    .map((id) => options.find((option) => String(option.id) === String(id)))
    .filter(Boolean)
    .map((option) => option.label);
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

const chipContainerStyle = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  marginTop: "0.5rem",
};

const chipStyle = {
  borderRadius: "999px",
  padding: "0.4rem 0.75rem",
};

const activeChipStyle = {
  ...chipStyle,
  backgroundColor: "#1f5fbf",
  color: "#fff",
  borderColor: "#1f5fbf",
};

const activeFilterSummaryStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: "1px solid #edf0f3",
  color: "#555",
};