import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { mockIPC, mockWindows, clearMocks } from "@tauri-apps/api/mocks";

// Mock Tauri window environment
beforeEach(() => {
  mockWindows("main");
  mockIPC((cmd, args) => {
    switch (cmd) {
      case "get_events":
        return [];
      case "create_event":
      case "update_event":
      case "delete_event":
      case "update_event_settings":
        return undefined;
      case "get_activities":
        return [];
      case "create_activity":
      case "update_activity":
      case "delete_activity":
        return undefined;
      case "get_groups":
        return [];
      case "create_group":
      case "update_group":
      case "delete_group":
      case "reorder_groups":
        return undefined;
      case "get_participants":
        return [];
      case "create_participant":
      case "update_participant":
      case "delete_participant":
        return undefined;
      default:
        console.warn(`Unhandled mocked Tauri command: ${cmd}`, args);
        return undefined;
    }
  });
});

afterEach(() => {
  cleanup();
  clearMocks();
  vi.clearAllMocks();
});
