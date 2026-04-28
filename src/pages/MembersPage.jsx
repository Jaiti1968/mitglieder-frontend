import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMembers } from "../api/memberApi";
import { getMemberStatuses, getVoices } from "../api/lookupApi";
import ErrorBox from "../components/common/ErrorBox";
import Pagination from "../components/members/Pagination";
import MemberList from "../components/members/MemberList";
import MemberFilterPanel from "../components/members/MemberFilterPanel";
import ResultInfo from "../components/members/ResultInfo";

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

      <MemberFilterPanel
        search={search}
        statusIds={statusIds}
        stimmeIds={stimmeIds}
        statuses={statuses}
        voices={voices}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onToggleFilter={toggleParam}
        onResetFilters={resetFilters}
      />

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

      {!isError && searchIsValid && (
        <MemberList members={members} searchParams={searchParams} />
      )}

      {!isError && (
        <Pagination page={page} pagination={pagination} setPage={setPage} />
      )}
    </main>
  );
}