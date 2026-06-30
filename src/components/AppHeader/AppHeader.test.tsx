import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderWithProviders, screen, act } from "../../test/test-utils";
import AppHeader from "./index";
import { UserInfo } from "../../api/services/User/store";

const aria: UserInfo = {
  firstName: "Aria",
  lastName: "Test",
  eMail: "aria@osapiens.com"
};

describe("AppHeader", () => {
  // Bug 3.3 — the avatar only appears once a user with an email is in the store.
  describe("3.3 — avatar vs. login link", () => {
    it("shows the avatar menu when a user with an email is provided", () => {
      renderWithProviders(<AppHeader user={aria} pageTitle="Home" />);
      expect(
        screen.getByRole("button", { name: /open user menu/i })
      ).toBeInTheDocument();
    });

    it("shows the Log in link (and no avatar) when there is no user", () => {
      renderWithProviders(<AppHeader user={null} pageTitle="Home" />);
      expect(
        screen.getByRole("link", { name: /log in/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /open user menu/i })
      ).toBeNull();
    });
  });

  // Bug 3.4 — the setInterval was never cleared (overlapping intervals piled up),
  // and the time is now derived from a fixed start timestamp instead of by
  // accumulating ticks. We control Date.now() independently of the fake timer
  // so we can simulate a throttled background tab (clock jumps, few ticks fire).
  describe("3.4 — countdown", () => {
    let nowMs = 0;

    beforeEach(() => {
      nowMs = 0;
      vi.spyOn(Date, "now").mockImplementation(() => nowMs);
      vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    // Set the wall clock to `elapsedMs` since mount, then fire a single tick.
    // Because the remaining time is derived from Date.now() - start, one tick is
    // enough to reflect any amount of elapsed time.
    const fireTickAt = (elapsedMs: number) => {
      nowMs = elapsedMs;
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    };

    it("starts at 60:00", () => {
      renderWithProviders(<AppHeader user={null} pageTitle="Home" />);
      expect(screen.getByText("60:00")).toBeInTheDocument();
    });

    it("derives the remaining time from the timestamp, not the tick count", () => {
      renderWithProviders(<AppHeader user={null} pageTitle="Home" />);

      fireTickAt(1000);
      expect(screen.getByText("59:59")).toBeInTheDocument();

      // A single tick after the clock jumped 10s shows 10s elapsed (throttle-safe);
      // tick-accumulation would only show 1 extra second.
      fireTickAt(10_000);
      expect(screen.getByText("59:50")).toBeInTheDocument();
    });

    it("clamps at 00:00 and never goes negative", () => {
      renderWithProviders(<AppHeader user={null} pageTitle="Home" />);

      fireTickAt(60 * 60 * 1000 + 5000);
      expect(screen.getByText("00:00")).toBeInTheDocument();

      fireTickAt(60 * 60 * 1000 + 30_000);
      expect(screen.getByText("00:00")).toBeInTheDocument();
    });

    it("clears its interval on unmount (the actual bug)", () => {
      const clearSpy = vi.spyOn(globalThis, "clearInterval");
      const { unmount } = renderWithProviders(
        <AppHeader user={null} pageTitle="Home" />
      );

      expect(clearSpy).not.toHaveBeenCalled();
      unmount();
      expect(clearSpy).toHaveBeenCalled();
    });

    it("does not leak intervals across remounts", () => {
      const clearSpy = vi.spyOn(globalThis, "clearInterval");

      renderWithProviders(<AppHeader user={null} pageTitle="Home" />).unmount();
      renderWithProviders(<AppHeader user={null} pageTitle="Home" />).unmount();

      // Each mount's interval is cleaned up on its unmount.
      expect(clearSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
