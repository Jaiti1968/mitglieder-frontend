import { parseGermanDateToIso } from "../dateHelpers";

export function createEhrungPayload(values) {
  return {
    honorTypeId: values?.honorTypeId ? Number(values.honorTypeId) : null,
    honorDate: values?.honorDate
      ? parseGermanDateToIso(values.honorDate)
      : null,
  };
}
