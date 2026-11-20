// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiscardChangesDialog from "../DiscardChangesDialog";

afterEach(cleanup);

const renderDialog = (overrides = {}) => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <DiscardChangesDialog
      open
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onConfirm, onCancel };
};

describe("DiscardChangesDialog", () => {
  it("zeigt bei open=false keinen Dialog", () => {
    renderDialog({ open: false });
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("zeigt die Bestätigungsfrage, beide Hinweise und die Aktionen", () => {
    renderDialog();
    const dialog = screen.getByRole("alertdialog", {
      name: "Änderungen verwerfen?",
    });
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Die letzten Änderungen konnten nicht gespeichert werden.")).toBeTruthy();
    expect(screen.getByText(/Möchtest du die ungespeicherten Änderungen verwerfen und den Dialog schließen\?/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nein" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ja" })).toBeTruthy();
  });

  it("ruft bei Nein ausschließlich onCancel auf", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Nein" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("ruft bei Ja ausschließlich onConfirm auf", async () => {
    const user = userEvent.setup();
    const { onConfirm, onCancel } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Ja" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
