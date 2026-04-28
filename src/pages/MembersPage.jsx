import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import ErrorBox from "../components/common/ErrorBox";

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const statusIds = searchParams.getAll("statusId");
  const stimmeIds = searchParams.getAll("stimmeId");
  const page = Number(searchParams.get("page") || 1);

  const searchIsValid = search.length === 0 || search.length >= 3;
  const hasActiveFilters =
    search.length > 0 || statusIds.length > 0 || stimmeIds.length > 0;

  function setSearch(value) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    setSearchParams(params);
  }

  function toggleParam(key, value) {
    const params = new URLSearchParams(searchParams);
    const currentValues = params.getAll(key);
    const valueAsString = String(value);

    params.delete(key);

    if (currentValues.includes(valueAsString)) {
      currentValues
        .filter((currentValue) => currentValue !== valueAsString)
        .forEach((currentValue) => params.append(key, currentValue));
    } else {
      currentValues.forEach((currentValue) => params.append(key, currentValue));
      params.append(key, valueAsString);
    }

    params.set("page", "1");
    setSearchParams(params);
  }

  function resetFilters() {
    setSearchParams({});
  }

  function setPage(newPage) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    setSearchParams(params);
  }

  const {
    data: membersData,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["members", search, statusIds, stimmeIds, page],
    queryFn: () =>
      getMembers({
        page,
        pageSize: PAGE_SIZE,
        search,
        statusIds,
        stimmeIds,
      }),
    enabled: searchIsValid,
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ["member-statuses"],
    queryFn: getMemberStatuses,
  });

  const { data: voices = [] } = useQuery({
    queryKey: ["voices"],
    queryFn: getVoices,
  });

  const members = membersData?.items ?? [];
  const pagination = membersData?.pagination;

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Mitglieder</h1>

      <section style={cardStyle}>
        <div style={filterTopRowStyle}>
          <input
            placeholder="Suche..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ width: "100%" }}
          />

          <button
            type="button"
            className="secondary"
            onClick={resetFilters}
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
              onClick={() => toggleParam("statusId", status.id)}
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
              onClick={() => toggleParam("stimmeId", voice.id)}
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

      <ResultInfo
        pagination={pagination}
        isFetching={isFetching}
        isError={isError}
      />

      {isError && <ErrorBox message={error.message} />}

      {!isError && (
        <Pagination page={page} pagination={pagination} setPage={setPage} />
      )}

      {!searchIsValid && (
        <p>Bitte mindestens 3 Zeichen für die Suche eingeben.</p>
      )}

      {!isError && !isFetching && searchIsValid && members.length === 0 && (
        <p>Keine Mitglieder gefunden</p>
      )}

      {!isError && (
        <div style={listStyle}>
          {searchIsValid &&
            members.map((member) => (
              <Link
                key={member.mitgliedsnummer}
                to={`/members/${member.mitgliedsnummer}?${searchParams.toString()}`}
                className="member-card"
              >
                <div>
                  <strong>
                    {member.vorname} {member.nachname}
                  </strong>
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    Nr. {member.mitgliedsnummer}
                  </div>
                </div>

                <div style={badgeContainer}>
                  {member.ort && <Badge type="neutral">{member.ort}</Badge>}

                  {member.mitgliedsstatus && (
                    <Badge type={getStatusType(member.mitgliedsstatus)}>
                      {member.mitgliedsstatus}
                    </Badge>
                  )}

                  {member.stimme && (
                    <Badge type="voice">{member.stimme}</Badge>
                  )}
                </div>
              </Link>
            ))}
        </div>
      )}

      {!isError && (
        <Pagination page={page} pagination={pagination} setPage={setPage} />
      )}
    </main>
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

function ResultInfo({ pagination, isFetching, isError }) {
  if (isError || !pagination) return null;

  return (
    <div style={resultInfoStyle}>
      <span>
        Seite <strong>{pagination.page}</strong> von{" "}
        <strong>{pagination.totalPages}</strong> ·{" "}
        <strong>{pagination.totalItems}</strong> Datensätze
      </span>

      {isFetching && <span>Lade...</span>}
    </div>
  );
}

function Pagination({ page, pagination, setPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const totalPages = pagination.totalPages;
  const pages = getVisiblePages(page, totalPages);

  return (
    <nav style={paginationStyle} aria-label="Seitennavigation">
      <button
        type="button"
        className="secondary"
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
      >
        ← Zurück
      </button>

      <div style={pageNumbersStyle}>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} style={ellipsisStyle}>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={item === page ? "" : "secondary"}
              onClick={() => setPage(item)}
              disabled={item === page}
              aria-current={item === page ? "page" : undefined}
              style={item === page ? activePageButtonStyle : undefined}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="secondary"
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
      >
        Weiter →
      </button>
    </nav>
  );
}

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "…", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "…",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "…",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "…",
    totalPages,
  ];
}

function Badge({ children, type = "default" }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function getStatusType(status) {
  if (!status) return "default";

  const s = status.toLowerCase();

  if (s.includes("verstorben")) return "danger";
  if (s.includes("nichtmitglied")) return "danger";
  if (s.includes("aktiv")) return "success";
  if (s.includes("kandidat")) return "success";
  if (s.includes("nicht")) return "muted";

  return "default";
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

const resultInfoStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "1rem 0 0.5rem",
  color: "#555",
};

const paginationStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.75rem",
  margin: "1rem 0",
  flexWrap: "wrap",
};

const pageNumbersStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  flexWrap: "wrap",
};

const activePageButtonStyle = {
  backgroundColor: "#1f5fbf",
  color: "#fff",
  borderColor: "#1f5fbf",
};

const ellipsisStyle = {
  color: "#777",
  padding: "0 0.25rem",
};

const listStyle = {
  display: "grid",
  gap: "0.75rem",
};

const badgeContainer = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};