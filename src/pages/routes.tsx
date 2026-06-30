import React from "react";
import { mdiBook, mdiEngine, mdiHome, mdiLogin } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, CircularProgress, Grow } from "@mui/material";
import { ERoute, TRoute } from "../types/global";

// Code-split each page: every route now ships in its own chunk and is only
// fetched when first navigated to (real lazy loading, not a decorative Suspense).
const Home = React.lazy(() => import("./Home"));
const Readme = React.lazy(() => import("./Readme"));
const Login = React.lazy(() => import("./Login"));
const Settings = React.lazy(() => import("./Settings"));

export const Loading = (
  <Grow in={true}>
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        bottom: "0px",
        top: "0px"
      }}
    >
      <CircularProgress />
    </Box>
  </Grow>
);

export const routes: TRoute[] = [
  {
    path: ERoute.HOME,
    Icon: <Icon path={mdiHome} size={1} />,
    Component: Home
  },
  {
    path: ERoute.README,
    Icon: <Icon path={mdiBook} size={1} />,
    Component: Readme
  },
  {
    path: ERoute.LOGIN,
    Icon: <Icon path={mdiLogin} size={1} />,
    Component: Login
  },
  {
    path: ERoute.SETTINGS,
    Icon: <Icon path={mdiEngine} size={1} />,
    Component: Settings,
    requiresAuth: true
  }
];
