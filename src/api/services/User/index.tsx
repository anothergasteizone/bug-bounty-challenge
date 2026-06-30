import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren
} from "react";
import { Box, CircularProgress } from "@mui/material";
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
    // Show a spinner (not a blank screen) while the persisted store hydrates.
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <UserStoreContext.Provider value={userStore}>
      {children}
    </UserStoreContext.Provider>
  );
};

export const useUserStore = () => useContext(UserStoreContext);
