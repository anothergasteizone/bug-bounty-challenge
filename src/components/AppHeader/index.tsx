import { Grow, Box, Theme, Toolbar, Typography } from "@mui/material";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { styled, useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserInfo } from "../../api/services/User/store";
import AvatarMenu from "../AvatarMenu";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../LanguageSwitcher";
import { ERoute } from "../../types/global";

interface AppBarProps extends MuiAppBarProps {
  theme?: Theme;
}
interface AppHeaderProps {
  user?: UserInfo | null;
  pageTitle: string;
}
const typoStyle = {
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
  lineHeight: 1
};
const COUNTDOWN_SECONDS = 60 * 60;
const AppBar = styled(MuiAppBar)<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.common.black,
  color: theme.palette.common.white,
  height: theme.tokens.header.height
}));
const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>((props, ref) => {
  const { user, pageTitle } = props;
  const { t } = useTranslation("app");
  const theme = useTheme();
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);
  const countdownMinutes = `${Math.floor(remaining / 60)}`.padStart(2, "0");
  const countdownSeconds = `${remaining % 60}`.padStart(2, "0");
  useEffect(() => {
    // Derive the remaining time from a fixed start timestamp instead of
    // accumulating ticks: setInterval is throttled in background tabs, so
    // counting ticks drifts. Clamp to 0 so it never goes negative.
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setRemaining(Math.max(COUNTDOWN_SECONDS - elapsed, 0));
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <AppBar ref={ref} position="fixed" sx={{ width: "100vw" }}>
      <Toolbar sx={{ background: "#08140C 0% 0% no-repeat padding-box" }}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center"
          }}
        >
          {/* Izquierda: counter */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
            <Typography variant="h6" component="div" color="primary">
              {countdownMinutes}:{countdownSeconds}
            </Typography>
          </Box>

          {/* Centro: título */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Link
              to={ERoute.ROOT}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography
                sx={{
                  ...typoStyle,
                  color: theme.palette.primary.main,
                  mb: theme.spacing(0.5)
                }}
                variant="h6"
                component="div"
              >
                {t("appTitle").toLocaleUpperCase()}
              </Typography>
              <Typography
                sx={{ ...typoStyle }}
                variant="overline"
                component="div"
                noWrap
              >
                {pageTitle.toLocaleUpperCase()}
              </Typography>
            </Link>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2
            }}
          >
            <LanguageSwitcher />
            {user && user.eMail && (
              <Grow in={Boolean(user && user.eMail)}>
                <AvatarMenu user={user} />
              </Grow>
            )}
            {!(user && user.eMail) && <Link to={ERoute.LOGIN}>Login</Link>}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
});
AppHeader.displayName = "AppHeader";
export default AppHeader;
