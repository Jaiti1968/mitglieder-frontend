import { describe, expect, it } from "vitest";
import { createEhrungPayload } from "../honorPayload";

describe("createEhrungPayload", () => {
  it("converts honor type and date for the backend", () => {
    const result = createEhrungPayload({
      honorTypeId: "3",
      honorDate: "16.03.2024",
    });

    expect(result).toEqual({
      honorTypeId: 3,
      honorDate: "2024-03-16",
    });
  });

  it("converts an empty honor date to null", () => {
    const result = createEhrungPayload({
      honorTypeId: "3",
      honorDate: "",
    });

    expect(result).toEqual({
      honorTypeId: 3,
      honorDate: null,
    });
  });

  it("converts a missing honor type to null", () => {
    const result = createEhrungPayload({
      honorTypeId: "",
      honorDate: "",
    });

    expect(result).toEqual({
      honorTypeId: null,
      honorDate: null,
    });
  });

  it("accepts numeric honor type IDs", () => {
    const result = createEhrungPayload({
      honorTypeId: 5,
      honorDate: "29.02.2024",
    });

    expect(result).toEqual({
      honorTypeId: 5,
      honorDate: "2024-02-29",
    });
  });
});
