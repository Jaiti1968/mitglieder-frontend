import { describe, expect, it } from "vitest";
import { validateMitgliedschaft } from "../membershipValidator";

describe("validateMitgliedschaft", () => {
  it("adds error for incomplete entry date", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05",
      austritt: "",
      mitgliedsstatusId: 1,
      stimmeId: 2,
    });

    expect(result).toEqual([
      {
        field: "eintritt",
        message: "Datum muss vollständig im Format TT.MM.JJJJ sein",
      },
    ]);
  });

  it("adds error when exit date is before entry date", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05.2026",
      austritt: "14.05.2026",
      mitgliedsstatusId: 1,
      stimmeId: 2,
    });

    expect(result).toEqual([
      {
        field: "austritt",
        message: "Austritt darf nicht vor Eintritt liegen",
      },
    ]);
  });

  it("adds error when member status is missing", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05.2026",
      austritt: "",
      mitgliedsstatusId: "",
      stimmeId: 2,
    });

    expect(result).toEqual([
      {
        field: "mitgliedsstatusId",
        message: "Mitgliederstatus ist Pflicht",
      },
    ]);
  });

  it("adds error when voice is missing", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05.2026",
      austritt: "",
      mitgliedsstatusId: 1,
      stimmeId: "",
    });

    expect(result).toEqual([
      {
        field: "stimmeId",
        message: "Stimme ist Pflicht",
      },
    ]);
  });

  it("adds multiple errors when several fields are invalid", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05",
      austritt: "14.05.2026",
      mitgliedsstatusId: "",
      stimmeId: "",
    });

    expect(result).toEqual([
      {
        field: "eintritt",
        message: "Datum muss vollständig im Format TT.MM.JJJJ sein",
      },
      {
        field: "mitgliedsstatusId",
        message: "Mitgliederstatus ist Pflicht",
      },
      {
        field: "stimmeId",
        message: "Stimme ist Pflicht",
      },
    ]);
  });

  it("accepts valid membership data", () => {
    const result = validateMitgliedschaft({
      eintritt: "15.05.2026",
      austritt: "",
      mitgliedsstatusId: 1,
      stimmeId: 2,
    });

    expect(result).toEqual([]);
  });
});
