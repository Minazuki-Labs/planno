import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateEventModal } from "./CreateEventModal";
import { useEventStore } from "../../store/useEventStore";

describe("CreateEventModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useEventStore.setState({ events: [] });
  });

  it("does not render when isOpen is false", () => {
    render(<CreateEventModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(<CreateEventModal isOpen={true} onClose={onClose} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });

  it("shows validation error when submitted with empty title", async () => {
    render(<CreateEventModal isOpen={true} onClose={onClose} />);

    const submitBtn = screen.getByRole("button", { name: /^create$/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Please enter a valid event name.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("creates event and closes modal when valid input is submitted", async () => {
    const user = userEvent.setup();
    render(<CreateEventModal isOpen={true} onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText(/e\.g\. Design Systems Sync/i);
    await user.type(titleInput, "Annual Conference 2026");

    const submitBtn = screen.getByRole("button", { name: /^create$/i });
    await user.click(submitBtn);

    expect(useEventStore.getState().events).toHaveLength(1);
    expect(useEventStore.getState().events[0].name).toBe("Annual Conference 2026");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<CreateEventModal isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
