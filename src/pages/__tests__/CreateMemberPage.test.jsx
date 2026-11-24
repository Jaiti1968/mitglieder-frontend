/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CreateMemberPage from "../CreateMemberPage";
import { createMember } from "../../api/memberApi";
import { getMemberStatuses, getVoices } from "../../api/lookupApi";

vi.mock("../../api/memberApi", () => ({
  createMember: vi.fn(),
}));

vi.mock("../../api/lookupApi", () => ({
  getMemberStatuses: vi.fn(),
  getVoices: vi.fn(),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreateMemberPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function changeField(name, value) {
  const field = document.querySelector(`[name="${name}"]`);

  expect(field).not.toBeNull();

  fireEvent.change(field, {
    target: { value },
  });
}

describe("CreateMemberPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getMemberStatuses.mockResolvedValue([{ id: 4, label: "Teststatus" }]);

    getVoices.mockResolvedValue([{ id: 6, label: "Teststimme" }]);

    createMember.mockResolvedValue({
      mitgliedsnummer: 99999,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("überträgt Datumswerte bei der Mitgliedsneuanlage im ISO-Format", async () => {
    renderPage();

    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");
    changeField("geburtsdatum", "15.06.1980");

    fireEvent.click(screen.getByRole("button", { name: "Mitgliedschaft" }));

    changeField("eintritt", "01.01.2025");
    changeField("austritt", "31.12.2025");

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createMember).toHaveBeenCalledTimes(1);
    });

    const payload = createMember.mock.calls[0][0];

    expect(payload.stammdaten.geburtsdatum).toBe("1980-06-15");
    expect(payload.mitgliedschaft.eintritt).toBe("2025-01-01");
    expect(payload.mitgliedschaft.austritt).toBe("2025-12-31");
  });

  it("überträgt leere Datumsfelder bei der Mitgliedsneuanlage korrekt", async () => {
    renderPage();

    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createMember).toHaveBeenCalledTimes(1);
    });

    const payload = createMember.mock.calls[0][0];

    expect(payload.stammdaten.geburtsdatum).toBe(null);
    expect(payload.mitgliedschaft.eintritt).toBeNull();
    expect(payload.mitgliedschaft.austritt).toBeNull();
  });

  it("überträgt bei einer Firma keine personenbezogenen Stammdaten", async () => {
    renderPage();

    changeField("anrede", "Herr");
    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");
    changeField("geburtsdatum", "15.06.1980");

    fireEvent.change(screen.getByPlaceholderText("oder frei eingeben"), {
      target: { value: "Dr." },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Firma / Organisation",
      }),
    );

    changeField("vorname", "");
    changeField("nachname", "Testfirma GmbH");

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createMember).toHaveBeenCalledTimes(1);
    });

    const payload = createMember.mock.calls[0][0];

    expect(payload.stammdaten.personFirma).toBe(true);
    expect(payload.stammdaten.anrede).toBe("");
    expect(payload.stammdaten.akademischerTitel).toBe("");
    expect(payload.stammdaten.geburtsdatum).toBe(null);
    expect(payload.stammdaten.vorname).toBe("");
    expect(payload.stammdaten.nachname).toBe("Testfirma GmbH");
  });

  it("T04 - überträgt Mitgliederstatus und Stimme als numerische IDs", async () => {
    renderPage();

    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");

    fireEvent.click(screen.getByRole("button", { name: "Mitgliedschaft" }));

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createMember).toHaveBeenCalledTimes(1);
    });

    const payload = createMember.mock.calls[0][0];

    expect(payload.mitgliedschaft.mitgliedsstatusId).toBe(4);
    expect(payload.mitgliedschaft.stimmeId).toBe(6);
  });

  it("T05 - verhindert die Mitgliedsneuanlage bei ungültigen Formulardaten", async () => {
    renderPage();

    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    changeField("geburtsdatum", "31.02.1980");

    await waitFor(() => {
      expect(saveButton.disabled).toBe(true);
    });

    fireEvent.click(saveButton);

    expect(createMember).not.toHaveBeenCalled();
  });

  it("T06 - überträgt nachträglich geleerte Datumsfelder als null", async () => {
    renderPage();

    changeField("vorname", "Max");
    changeField("nachname", "Testmitglied");
    changeField("geburtsdatum", "15.06.1980");

    fireEvent.click(screen.getByRole("button", { name: "Mitgliedschaft" }));

    changeField("eintritt", "01.01.2025");
    changeField("austritt", "31.12.2025");

    fireEvent.click(screen.getByRole("button", { name: "Stammdaten" }));

    changeField("geburtsdatum", "");

    fireEvent.click(screen.getByRole("button", { name: "Mitgliedschaft" }));

    changeField("austritt", "");
    changeField("eintritt", "");

    fireEvent.click(screen.getByRole("button", { name: "Kontakt" }));

    const saveButton = screen.getByRole("button", {
      name: "Speichern",
    });

    await waitFor(() => {
      expect(saveButton.disabled).toBe(false);
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(createMember).toHaveBeenCalledTimes(1);
    });

    const payload = createMember.mock.calls[0][0];

    expect(payload.stammdaten.geburtsdatum).toBe(null);
    expect(payload.mitgliedschaft.eintritt).toBe(null);
    expect(payload.mitgliedschaft.austritt).toBe(null);
  });
});
