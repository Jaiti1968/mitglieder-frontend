// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import MemberHonorEditDialog from "../MemberHonorEditDialog";

const honor = {
  honorId: 42,
  honorTypeId: 1,
  honorName: "20 Jahre singen im EMC",
  honorDate: "2020-01-02",
};
const honorTypes = [
  { id: 1, label: "20 Jahre singen im EMC" },
  { id: 2, label: "25 Jahre singen im EMC" },
];

function setup(overrides = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  const onDelete = vi.fn();
  render(
    <MemberHonorEditDialog
      open
      honor={honor}
      honorTypes={honorTypes}
      existingHonors={[honor]}
      onSave={onSave}
      onClose={onClose}
      onDelete={onDelete}
      {...overrides}
    />,
  );
  return { onSave, onClose, onDelete };
}

function changeDate(value) {
  fireEvent.change(screen.getByRole("textbox", { name: "Ehrungsdatum" }), {
    target: { value },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("MemberHonorEditDialog – AutoSave und Schließen", () => {
  it("speichert eine gültige Datumsänderung nach der AutoSave-Verzögerung", async () => {
    const { onSave } = setup();
    changeDate("13.03.2026");
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: 2500,
    });
    expect(onSave).toHaveBeenCalledWith({
      honorTypeId: 1,
      honorDate: "2026-03-13",
    });
  });

  it("speichert eine gültige Änderung beim sofortigen Schließen", async () => {
    const { onSave, onClose } = setup();
    changeDate("13.03.2026");
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      honorTypeId: 1,
      honorDate: "2026-03-13",
    });
  });

  it("fragt beim Schließen mit ungültigem Datum nach dem Verwerfen und behält bei Nein die Eingabe", async () => {
    const { onSave, onClose } = setup();
    changeDate("31.02.2026");
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    const confirmation = await screen.findByRole("alertdialog", {
      name: "Änderungen verwerfen?",
    });
    expect(onSave).not.toHaveBeenCalled();
    fireEvent.click(within(confirmation).getByRole("button", { name: "Nein" }));
    expect(
      screen.queryByRole("alertdialog", { name: "Änderungen verwerfen?" }),
    ).toBeNull();
    expect(screen.getByPlaceholderText("TT.MM.JJJJ").value).toBe("31.02.2026");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("schließt nach Ja trotz ungültiger Eingabe, ohne zu speichern", async () => {
    const { onSave, onClose } = setup();
    changeDate("31.02.2026");
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    const confirmation = await screen.findByRole("alertdialog", {
      name: "Änderungen verwerfen?",
    });
    fireEvent.click(within(confirmation).getByRole("button", { name: "Ja" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("zeigt bei einem fehlgeschlagenen Speichern die Verwerfen-Bestätigung", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Testfehler"));
    const onClose = vi.fn();
    setup({ onSave, onClose });
    changeDate("13.03.2026");
    fireEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(
      await screen.findByRole("alertdialog", { name: "Änderungen verwerfen?" }),
    ).toBeTruthy();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });
});
