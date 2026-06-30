import { Box, Slide } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useUserStore } from "../../api/services/User";
import { isAlive } from "mobx-state-tree";
import AppHeader from "../../components/AppHeader";
import { observer } from "mobx-react";
import { Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, matchPath, useLocation } from "react-router-dom";
import { ERoute } from "../../types/global";
import { Loading, routes } from "../routes";

const hideSplashScreen = () => {
  const splashscreen = document.getElementById("app-splashscreen");

  if (splashscreen) {
    splashscreen.className = "";
    setTimeout(() => {
      splashscreen.remove();
    }, 300);
  }
};

const Root = () => {
  const { t } = useTranslation("app");
  const userStore = useUserStore();
  const user = userStore?.user;
  // Flat userInfo, passing the live MST node would make React
  // read its fields while it unmounts after logout.
  const userInfo =
    user && isAlive(user)
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          eMail: user.eMail
        }
      : null;
  const theme = useTheme();
  const location = useLocation();

  const activeRoute = routes.find((route) =>
    matchPath({ path: route.path, end: false }, location.pathname)
  );
  const pageTitle = t(`routes.${activeRoute?.path ?? ERoute.HOME}`);

  useEffect(() => {
    hideSplashScreen();
  }, []);

  return (
    <div
      id="portal-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh"
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#f5f5f5"
        }}
      >
        <Slide direction="down" in mountOnEnter>
          <AppHeader user={userInfo} pageTitle={pageTitle} />
        </Slide>
        <Box
          component="main"
          sx={{
            position: "relative",
            height: `calc(100% - ${theme.tokens.header.height})`,
            width: "100%",
            marginTop:
              theme.tokens.header.height /* Necessary because of AppBar */
          }}
        >
          <Suspense fallback={Loading}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </div>
  );
};

export default observer(Root);
