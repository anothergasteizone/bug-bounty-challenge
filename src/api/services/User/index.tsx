import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from "react";
import UserStore, { UserStoreInstance } from "./store";
import { persist } from "mst-persist";

const UserStoreContext = createContext<UserStoreInstance | null>(null);

const userStore = UserStore.create({ user: null, isLoading: false });

export const StoreProvider: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    persist("userStore", userStore, {
      whitelist: ["user"]
    }).then(() => setIsHydrated(true));
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
      <UserStoreContext.Provider value={userStore}>
        {children}
      </UserStoreContext.Provider>
  );
};

export const useUserStore = () => useContext(UserStoreContext);
