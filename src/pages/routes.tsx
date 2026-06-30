import React, { Suspense } from "react";
import {mdiBook, mdiEngine, mdiHome, mdiLogin} from "@mdi/js";
import Icon from "@mdi/react";
import { Box, CircularProgress, Grow } from "@mui/material";
import { ERoute, TRoute } from "../types/global";
import Home from "./Home";
import Readme from "./Readme";
import Login from "./Login";
import Settings from "./Settings";

const Loading = (
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
const lazyLoad = (Component: React.ComponentType) => {
  const LazyLoaded = () => (
    <Suspense fallback={Loading}>
      <Component />
    </Suspense>
  );
  return LazyLoaded;
};

export const routes: TRoute[] = [
  {
    path: ERoute.HOME,
    Icon: <Icon path={mdiHome} size={1} />,
    Component: lazyLoad(Home)
  },
  {
    path: ERoute.README,
    Icon: <Icon path={mdiBook} size={1} />,
    Component: lazyLoad(Readme)
  },
  {
    path: ERoute.LOGIN,
    Icon: <Icon path={mdiLogin} size={1} />,
    Component: lazyLoad(Login)
  },
  {
    path: ERoute.SETTINGS,
    Icon: <Icon path={mdiEngine} size={1} />,
    Component: lazyLoad(Settings)
  }
];
