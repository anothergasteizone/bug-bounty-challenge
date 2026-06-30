import { describe, it, expect } from "vitest";
import { observer } from "mobx-react";
import { applySnapshot } from "mobx-state-tree";
import {
  renderWithProviders,
  screen,
  act,
  userEvent,
  waitFor
} from "../../test/test-utils";
import AvatarMenu, { stringAvatar, getInitials } from "./index";
import { useUserStore } from "../../api/services/User";
import { UserInfo, UserStoreInstance } from "../../api/services/User/store";

const aria: UserInfo = {
  firstName: "Aria",
  lastName: "Test",
  eMail: "aria@osapiens.com"
};

describe("AvatarMenu (bug 3.3 — avatar in the app bar)", () => {
  // Sub-bug: the color used to come from parseInt on the initials, so emoji or
  // symbol initials produced NaN -> rgb(NaN,NaN,NaN). It is now a hash of stable
  // user data and must always yield a valid mid-range color.
  describe("deterministic avatar color (never rgb(NaN))", () => {
    const cases: Array<[string, UserInfo]> = [
      ["normal user", aria],
      ["emoji-only names", { firstName: "🙂", lastName: "🚀" }],
      ["symbol initials", { firstName: "!", lastName: "#" }],
      ["empty names", { firstName: "", lastName: "" }],
      ["no fields at all", {}]
    ];

    it.each(cases)("produces a valid rgb() color for %s", (_label, user) => {
      const { sx } = stringAvatar(user);
      expect(sx.bgcolor).toMatch(/^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/);
      expect(sx.bgcolor).not.toContain("NaN");
    });

    it("is deterministic for the same user", () => {
      expect(stringAvatar(aria).sx.bgcolor).toBe(stringAvatar(aria).sx.bgcolor);
    });

    it("computes uppercase initials", () => {
      expect(getInitials(aria)).toBe("AT");
      expect(getInitials({})).toBe("");
    });
  });

  describe("menu", () => {
    it("opens and shows the user details, edit and logout actions", async () => {
      renderWithProviders(<AvatarMenu user={aria} />);

      await userEvent.click(
        screen.getByRole("button", { name: /open user menu/i })
      );

      expect(screen.getByText("Aria Test")).toBeInTheDocument();
      expect(screen.getByText("aria@osapiens.com")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit profile/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
    });
  });

  // Sub-bug (the second, hidden one): the store was rebuilt on every render, so
  // user updates never propagated. With a singleton store + an `observer`
  // consumer, applying a user to the store must make the avatar appear — and
  // logging out must make it disappear again.
  describe("singleton store + observer reactivity", () => {
    const Probe = observer(() => {
      const store = useUserStore();
      const user = store?.user;
      return user && user.eMail ? (
        <AvatarMenu
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            eMail: user.eMail
          }}
        />
      ) : (
        <div>no-user</div>
      );
    });

    const StoreCapture = ({
      onReady
    }: {
      onReady: (s: UserStoreInstance) => void;
    }) => {
      const store = useUserStore();
      if (store) onReady(store);
      return <Probe />;
    };

    it("shows the avatar when the store gains a user, and hides it on logout", async () => {
      let store: UserStoreInstance | null = null;
      renderWithProviders(<StoreCapture onReady={(s) => (store = s)} />, {
        withStore: true
      });

      // StoreProvider renders a spinner until the persisted store hydrates.
      await waitFor(() => expect(store).not.toBeNull());

      // Clean baseline (the singleton survives across tests).
      act(() =>
        applySnapshot(store!, { user: null, isLoading: false })
      );
      expect(screen.getByText("no-user")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /open user menu/i })
      ).toBeNull();

      // A user enters the store -> the observer re-renders and the avatar shows.
      act(() =>
        applySnapshot(store!, { user: aria, isLoading: false })
      );
      expect(
        await screen.findByRole("button", { name: /open user menu/i })
      ).toBeInTheDocument();

      // Logout via the menu clears the user -> avatar disappears.
      await userEvent.click(
        screen.getByRole("button", { name: /open user menu/i })
      );
      await userEvent.click(
        screen.getByRole("button", { name: /logout/i })
      );

      expect(store!.user).toBeNull();
      await waitFor(() =>
        expect(
          screen.queryByRole("button", { name: /open user menu/i })
        ).toBeNull()
      );
    });
  });
});
