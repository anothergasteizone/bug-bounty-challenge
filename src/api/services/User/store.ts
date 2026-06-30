import { types, flow, Instance, SnapshotIn } from "mobx-state-tree";
import {
  ActionError,
  ActionResultStatus,
  ActionSuccess
} from "../../../types/global";
import { resultOrError, ResultOrErrorResponse } from "../../../utils/global";

const UserModel = types.model("User", {
  firstName: types.maybe(types.string),
  lastName: types.maybe(types.string),
  eMail: types.maybe(types.string)
});

type UserSnapshot = SnapshotIn<typeof UserModel>;

// Demo credentials are injected at build time from `.env` (see `.env.example`).
// Vite reads VITE_-prefixed vars and inlines them into the bundle, so they are
// no longer hardcoded in the source.
const DEMO_USER_EMAIL = import.meta.env.VITE_DEMO_USER_EMAIL;
const DEMO_USER_PASSWORD = import.meta.env.VITE_DEMO_USER_PASSWORD;

if (import.meta.env.DEV && (!DEMO_USER_EMAIL || !DEMO_USER_PASSWORD)) {
  console.warn(
    "[UserStore] Missing VITE_DEMO_USER_EMAIL / VITE_DEMO_USER_PASSWORD. " +
      "Run `cp .env.example .env` so the demo login works."
  );
}

export interface LoginCredentials {
  eMail: string;
  password: string;
}

export interface UserSettings {
  firstName: string;
  lastName: string;
}

export interface UserInfo {
  firstName?: string;
  lastName?: string;
  eMail?: string;
}

const handleResult = <T>(
  result: T | null,
  error: Error | null
): ActionSuccess<T> | ActionError => {
  if (error) {
    return { status: ActionResultStatus.ERROR, error };
  }
  if (result) {
    return { status: ActionResultStatus.SUCCESS, result };
  }
  return {
    status: ActionResultStatus.ERROR,
    error: new Error("Something went wrong.")
  };
};

const UserStore = types
  .model("UserStore", {
    user: types.maybeNull(UserModel),
    isLoading: types.optional(types.boolean, false)
  })
  .actions((self) => ({
    saveSettings: flow(function* (settings: UserSettings) {
      if (!self.user) {
        return handleResult<UserSnapshot>(
          null,
          new Error("No session is currently active.")
        );
      }

      self.isLoading = true;
      try {
        const [result, error]: ResultOrErrorResponse<UserSnapshot> =
          yield resultOrError(
            new Promise<UserSnapshot>((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    firstName: settings.firstName,
                    lastName: settings.lastName,
                    eMail: self.user?.eMail
                  }),
                500
              )
            )
          );

        if (result) {
          if (self.user) {
            self.user.firstName = result.firstName;
            self.user.lastName = result.lastName;
          } else {
            self.user = UserModel.create(result);
          }
        }
        return handleResult(result, error);
      } finally {
        self.isLoading = false;
      }
    }),
    login: flow(function* (credentials: LoginCredentials) {
      self.isLoading = true;
      try {
        const [result, error]: ResultOrErrorResponse<UserSnapshot> =
          yield resultOrError(
            new Promise<UserSnapshot>((resolve, reject) =>
              // Keep to fake server.
              setTimeout(() => {
                if (
                  credentials.eMail === DEMO_USER_EMAIL &&
                  credentials.password === DEMO_USER_PASSWORD
                ) {
                  resolve({
                    firstName: "Aria",
                    lastName: "Test",
                    eMail: credentials.eMail
                  });
                } else {
                  reject(new Error("Invalid email or password."));
                }
              }, 500)
            )
          );

        if (result) {
          self.user = UserModel.create(result);
        }
        return handleResult(result, error);
      } finally {
        self.isLoading = false;
      }
    }),

    logout() {
      self.user = null;
    }
  }));

export type User = Instance<typeof UserModel>;
export type UserStoreInstance = Instance<typeof UserStore>;
export default UserStore;
