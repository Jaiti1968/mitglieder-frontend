// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmationDialog from "../DeleteConfirmationDialog";

afterEach(cleanup);

const defaultProps = {
  open: true,
  itemType: "Ehrung",
  itemName: "20 Jahre singen im EMC",
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
};

function renderDialog(overrides = {}) {
  const props = {
    ...defaultProps,
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
    ...overrides,
  };
  render(<DeleteConfirmationDialog {...props} />);
  return props;
}

describe("DeleteConfirmationDialog", () => {
  it("zeigt bei open=false keinen Dialog", () => {
    renderDialog({ open: false });
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("zeigt Ehrungsname, Warnung und die beiden Aktionen", () => {
    renderDialog();
    const dialog = screen.getByRole("alertdialog", { name: "Ehrung löschen?" });
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/20 Jahre singen im EMC/)).toBeTruthy();
    expect(screen.getByText(/nicht rückgängig gemacht/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nein" }).disabled).toBe(false);
    expect(screen.getByRole("button", { name: "Ja, löschen" }).disabled).toBe(
      false,
    );
  });

  it("ruft bei Nein ausschließlich onCancel auf", async () => {
    const user = userEvent.setup();
    const props = renderDialog();
    await user.click(screen.getByRole("button", { name: "Nein" }));
    expect(props.onCancel).toHaveBeenCalledOnce();
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  it("ruft bei Ja, löschen ausschließlich onConfirm auf", async () => {
    const user = userEvent.setup();
    const props = renderDialog();
    await user.click(screen.getByRole("button", { name: "Ja, löschen" }));
    expect(props.onConfirm).toHaveBeenCalledOnce();
    expect(props.onCancel).not.toHaveBeenCalled();
  });

  it("sperrt beide Aktionen während des Löschens", () => {
    renderDialog({ deleting: true });
    expect(screen.getByRole("button", { name: "Nein" }).disabled).toBe(true);
    expect(screen.getByRole("button", { name: "Lösche..." }).disabled).toBe(
      true,
    );
  });

  it("zeigt bei einem Löschfehler die Fehlermeldung und lässt beide Aktionen zu", () => {
    renderDialog({ error: new Error("Server nicht erreichbar") });
    expect(screen.getByRole("alert", { name: "" }).textContent).toMatch(
      /Löschen fehlgeschlagen/,
    );
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nein" }).disabled).toBe(false);
    expect(screen.getByRole("button", { name: "Ja, löschen" }).disabled).toBe(
      false,
    );
  });
});
