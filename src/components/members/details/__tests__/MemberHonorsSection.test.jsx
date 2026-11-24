// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MemberHonorsSection from "../MemberHonorsSection";
import { getMemberHonors, deleteMemberHonor } from "../../../../api/honorApi";

vi.mock("../../../../api/honorApi", () => ({
  getMemberHonors: vi.fn(),
  createMemberHonor: vi.fn(),
  updateMemberHonor: vi.fn(),
  deleteMemberHonor: vi.fn(),
}));
vi.mock("../../../../api/lookupApi", () => ({
  getHonors: vi.fn().mockResolvedValue([]),
}));

// Hier wird die Anbindung der Section an die Mutation geprüft.
// Die Darstellung des echten Bestätigungsdialogs wird separat getestet.
vi.mock("../MemberHonorCreateDialog", () => ({ default: () => null }));
vi.mock("../MemberHonorEditDialog", () => ({
  default: ({ open, honor, onDelete, deleting, deleteError, onClose }) =>
    open ? (
      <div role="dialog" aria-label="Ehrung bearbeiten">
        <span>{honor.honorName}</span>
        {deleteError && <p role="alert">Löschen fehlgeschlagen</p>}
        <button
          type="button"
          onClick={() => void Promise.resolve(onDelete()).catch(() => {})}
          disabled={deleting}
        >
          Löschen bestätigen
        </button>
        <button type="button" onClick={onClose}>
          Schließen
        </button>
      </div>
    ) : null,
}));

const honors = [
  {
    honorId: 17,
    honorTypeId: 3,
    honorName: "20 Jahre singen im EMC",
    honorDate: "2020-01-02",
  },
];

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemberHonorsSection mitgliedsnummer={1222} canEdit />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("MemberHonorsSection – Löschfehler", () => {
  it("behält bei einem API-Fehler die Ehrung und den Bearbeitungsdialog bei und erlaubt einen erneuten Versuch", async () => {
    getMemberHonors.mockResolvedValue(honors);
    deleteMemberHonor.mockRejectedValueOnce(
      new Error("Server nicht erreichbar"),
    );
    deleteMemberHonor.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderSection();

    await user.click(
      await screen.findByRole("button", { name: /20 Jahre singen im EMC/i }),
    );
    expect(
      screen.getByRole("dialog", { name: "Ehrung bearbeiten" }),
    ).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Löschen bestätigen" }),
    );
    await screen.findByRole("alert");

    expect(deleteMemberHonor).toHaveBeenCalledWith(1222, 17);
    expect(
      screen.getByRole("dialog", { name: "Ehrung bearbeiten" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /20 Jahre singen im EMC/i }),
    ).toBeTruthy();

    // Ein zweiter Versuch wird an die API weitergereicht.
    await user.click(
      screen.getByRole("button", { name: "Löschen bestätigen" }),
    );
    await waitFor(() => expect(deleteMemberHonor).toHaveBeenCalledTimes(2));
  });
});

// Lokale Kalenderdaten statt UTC-ISO-Konvertierung: vermeidet Verschiebungen
// um einen Tag in Zeitzonen mit negativem UTC-Offset.
function dateOffsetIso(days) {
  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + days,
  );
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function germanDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

async function renderHonorForDate(honorDate) {
  getMemberHonors.mockResolvedValue([{ ...honors[0], honorDate }]);
  renderSection();
  await screen.findByText(honors[0].honorName);
  return screen.getByRole("button", { name: /20 Jahre singen im EMC/i });
}

describe("MemberHonorsSection – ER-005: Zukünftiger Termin", () => {
  it("kennzeichnet ein zukünftiges Ehrungsdatum unterhalb der Ehrungsbezeichnung", async () => {
    const isoDate = dateOffsetIso(1);
    const card = await renderHonorForDate(isoDate);
    const description = card.querySelector(".honor-card-description");
    const dateGroup = card.querySelector(".honor-card-date");

    expect(within(card).getByText("Zukünftiger Termin")).toBeTruthy();
    expect(within(card).getByText(germanDate(isoDate))).toBeTruthy();

    expect(description.children[0].textContent.trim()).toBe(
      honors[0].honorName,
    );
    expect(description.children[1].textContent.trim()).toBe(
      "Zukünftiger Termin",
    );
    expect(dateGroup.textContent.trim()).toBe(germanDate(isoDate));
  });

  it("zeigt am Tag der Ehrung keinen Zukunftshinweis", async () => {
    const isoDate = dateOffsetIso(0);
    const card = await renderHonorForDate(isoDate);

    expect(within(card).getByText(germanDate(isoDate))).toBeTruthy();
    expect(within(card).queryByText("Zukünftiger Termin")).toBeNull();
  });

  it("zeigt bei einer vergangenen Ehrung keinen Zukunftshinweis", async () => {
    const isoDate = dateOffsetIso(-1);
    const card = await renderHonorForDate(isoDate);

    expect(within(card).getByText(germanDate(isoDate))).toBeTruthy();
    expect(within(card).queryByText("Zukünftiger Termin")).toBeNull();
  });

  it("zeigt bei fehlendem Ehrungsdatum keinen Zukunftshinweis", async () => {
    const card = await renderHonorForDate(null);

    expect(within(card).getByText("–")).toBeTruthy();
    expect(within(card).queryByText("Zukünftiger Termin")).toBeNull();
  });
});

describe("MemberHonorsSection – Spaltenlayout", () => {
  it("zeigt bei vorhandenen Ehrungen die Spaltenüberschriften an", async () => {
    getMemberHonors.mockResolvedValue(honors);
    renderSection();

    await screen.findByText(honors[0].honorName);

    expect(screen.getByText("Ehrung")).toBeTruthy();
    expect(screen.getByText("Verliehen am")).toBeTruthy();
  });

  it("zeigt ohne Ehrungen keine Spaltenüberschriften an", async () => {
    getMemberHonors.mockResolvedValue([]);
    renderSection();

    await waitFor(() => {
      expect(getMemberHonors).toHaveBeenCalled();
    });

    expect(screen.queryByText("Ehrung")).toBeNull();
    expect(screen.queryByText("Verliehen am")).toBeNull();
  });
});
