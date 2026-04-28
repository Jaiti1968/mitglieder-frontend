import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import ErrorBox from "../components/common/ErrorBox";

const PAGE_SIZE = 20;

export default function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const statusId = searchParams.get("statusId") || "";
  const stimmeId = searchParams.get("stimmeId") || "";
  const page = Number(searchParams.get("page") || 1);

  const searchIsValid = search.length === 0 || search.length >= 3;

  function setParam(key, value) {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    setSearchParams(params);
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
    queryKey: ["members", search, statusId, stimmeId, page],
    queryFn: () =>
      getMembers({
        page,
        pageSize: PAGE_SIZE,
        search,
        statusId,
        stimmeId,
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

  const members = membersData?.items ?? membersData ?? [];
  const pagination = membersData?.pagination;

  return (
    <main>
      <h1 style={{ marginBottom: "1rem" }}>Mitglieder</h1>

      <section style={cardStyle}>
        <div style={filterGrid}>
          <input
            placeholder="Suche..."
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
          />

          <select
            value={statusId}
            onChange={(e) => setParam("statusId", e.target.value)}
          >
            <option value="">Alle Status</option>
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={stimmeId}
            onChange={(e) => setParam("stimmeId", e.target.value)}
          >
            <option value="">Alle Stimmen</option>
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>
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

function ResultInfo({ pagination, isFetching, isError }) {
  if (isError) return null;
  if (!pagination) return null;

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

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr",
  gap: "1rem",
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