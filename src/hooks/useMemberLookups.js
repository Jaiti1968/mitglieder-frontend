import { useQuery } from "@tanstack/react-query";
import { getMemberStatuses, getVoices } from "../api/lookupApi";

export default function useMemberLookups() {
  const { data: statuses = [] } = useQuery({
    queryKey: ["member-statuses"],
    queryFn: getMemberStatuses,
  });

  const { data: voices = [] } = useQuery({
    queryKey: ["voices"],
    queryFn: getVoices,
  });

  return {
    statuses,
    voices,
  };
}
