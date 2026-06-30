import { Box, Slide } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useUserStore } from "../../api/services/User";
import { isAlive } from "mobx-state-tree";
import AppHeader from "../../components/AppHeader";
import useMatchedRoute from "../../hooks/useMatchedRoute";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ERoute } from "../../types/global";
import AccessDenied from "../AccessDenied";
import { routes } from "../routes";

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
  // Snapshot plano para el header: ver nota en UserInfo (store.ts). Si pasáramos
  // el nodo MST, React leería sus campos al desmontar tras el logout (nodo muerto).
  const userInfo =
    user && isAlive(user)
      ? { firstName: user.firstName, lastName: user.lastName, eMail: user.eMail }
      : null;
  const theme = useTheme();
  const [fallbackRoute] = routes;
  const Fallback = fallbackRoute.Component;
  const { route = fallbackRoute, MatchedElement } = useMatchedRoute(
    routes,
    Fallback,
    { matchOnSubPath: true }
  );

  const pageTitle = t(`routes.${route.path}`);

  const accessDenied = route.path === ERoute.SETTINGS && !user;

  useEffect(() => {
    hideSplashScreen();
  }, []);

  if (accessDenied) {
    return <AccessDenied />;
  }

  return (
    <div
      id="portal-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
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
          {MatchedElement}
        </Box>
      </Box>
    </div>
  );
};

export default observer(Root);
