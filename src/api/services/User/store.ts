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
  error: unknown
): ActionSuccess<T> | ActionError => {
  if (error) {
    return { status: ActionResultStatus.ERROR, error };
  }
  if (result) {
    return { status: ActionResultStatus.SUCCESS, result };
  }
  return { status: ActionResultStatus.ERROR, error: "Something went wrong." };
};

const UserStore = types
    .model("UserStore", {
      user: types.maybeNull(UserModel),
      isLoading: types.optional(types.boolean, false)
    })
    .actions((self) => ({
      getOwnUser: flow(function* () {
        self.isLoading = true;
        try {
          const [result, error] = (yield resultOrError(
              new Promise<UserSnapshot>((resolve) =>
                  resolve({
                    firstName: "Aria",
                    lastName: "Test",
                    eMail: "linda.bolt@osapiens.com"
                  })
              )
          )) as ResultOrErrorResponse<UserSnapshot>;

          if (result) {
            self.user = UserModel.create(result);
          }
          return handleResult(result, error);
        } finally {
          self.isLoading = false;
        }
      }),

      saveSettings: flow(function* (settings: UserSettings) {
        if (!self.user) {
          return handleResult<UserSnapshot>(null, "No hay ninguna sesión iniciada.");
        }

        self.isLoading = true;
        try {
          const [result, error] = (yield resultOrError(
              new Promise<UserSnapshot>((resolve) =>
                  //Keep to fake server.
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
          )) as ResultOrErrorResponse<UserSnapshot>;

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
          const [result, error] = (yield resultOrError(
              new Promise<UserSnapshot>((resolve, reject) =>
                  //Keep to fake server.
                  setTimeout(() => {
                    if (
                        credentials.eMail === "linda.bolt@osapiens.com" &&
                        credentials.password === "1234"
                    ) {
                      resolve({
                        firstName: "Aria",
                        lastName: "Test",
                        eMail: credentials.eMail
                      });
                    } else {
                      reject("Invalid email or password.");
                    }
                  }, 500)
              )
          )) as ResultOrErrorResponse<UserSnapshot>;

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