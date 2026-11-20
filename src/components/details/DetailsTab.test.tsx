import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DetailsTab } from "./DetailsTab";
import { EventItem } from "../../types/event";

describe("DetailsTab", () => {
  const sampleEvent: EventItem = {
    id: "evt-1",
    name: "Tech Summit 2026",
    eventDate: "2026/09/15",
    lastEdited: "2026-09-01T10:00:00.000Z",
    location: "Auditorium A",
    settings: { groupsEnabled: true },
  };

  it("renders event details correctly in view mode", () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<DetailsTab event={sampleEvent} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText("Tech Summit 2026")).toBeInTheDocument();
    expect(screen.getByText("Auditorium A")).toBeInTheDocument();
    expect(screen.getByText("2026/09/15")).toBeInTheDocument();
    expect(screen.getByText("Groups")).toBeInTheDocument();
  });

  it("toggles groups module setting and triggers onUpdate", () => {
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<DetailsTab event={sampleEvent} onUpdate={onUpdate} onDelete={onDelete} />);

    const toggleButton = screen.getByRole("switch");
    fireEvent.click(toggleButton);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].settings.groupsEnabled).toBe(false);
  });

  it("switches to editing mode, modifies name, and saves changes", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<DetailsTab event={sampleEvent} onUpdate={onUpdate} onDelete={onDelete} />);

    const editBtn = screen.getByRole("button", { name: /edit details/i });
    await user.click(editBtn);

    const nameInput = screen.getByDisplayValue("Tech Summit 2026");
    await user.clear(nameInput);
    await user.type(nameInput, "Tech Summit 2026 Global");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].name).toBe("Tech Summit 2026 Global");
  });

  it("triggers onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(<DetailsTab event={sampleEvent} onUpdate={onUpdate} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole("button", { name: /delete event/i });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
