import { observer } from "mobx-react";
import { mdiLogoutVariant, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import Menu from "@mui/material/Menu";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { UserInfo } from "../../api/services/User/store";
import { useUserStore } from "../../api/services/User";
import { useNavigate } from "react-router-dom";
import { ERoute } from "../../types/global";

interface AvatarMenuProps {
  user: UserInfo;
}

const getInitials = (user: UserInfo) => {
  if (user.firstName || user.lastName) {
    const initials = [user.firstName, user.lastName]
      .map((_) => (_ && _[0] ? _[0].toLocaleUpperCase() : (_ ?? "")))
      .join("");
    return initials;
  }
  return "";
};

// Deterministic 32-bit string hash, so the same user always maps to the same
// color across sessions.
const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const stringAvatar = (user: UserInfo) => {
  const initials = getInitials(user);
  // Derive the color from a hash of stable user data instead of parseInt on the
  // initials: non-alphanumeric initials (emoji, symbols) produced NaN ->
  // rgb(NaN,NaN,NaN). This always yields a valid, legible mid-range color.
  const seed =
    user.eMail || `${user.firstName ?? ""}${user.lastName ?? ""}` || "user";
  const hash = hashString(seed);
  const r = 80 + (hash % 128);
  const g = 80 + ((hash >> 8) % 128);
  const b = 80 + ((hash >> 16) % 128);
  return {
    sx: { bgcolor: `rgb(${r},${g},${b})` },
    children: initials
  };
};

const AvatarMenu = React.forwardRef<HTMLDivElement, AvatarMenuProps>(
  (props, ref) => {
    const navigate = useNavigate();
    const userStore = useUserStore();
    const { user } = props;
    const theme = useTheme();
    const { t } = useTranslation("app");
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
      <div ref={ref}>
        <IconButton
          id="avatar-menu-button"
          onClick={handleClick}
          sx={{ p: 0 }}
          aria-label={t("avatarMenu.openMenu")}
          aria-haspopup="menu"
          aria-controls={open ? "avatar-menu" : undefined}
          aria-expanded={open}
        >
          <Avatar {...stringAvatar(user)} />
        </IconButton>
        <Menu
          id="avatar-menu"
          aria-labelledby="avatar-menu-button"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 1
            }}
          >
            <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
            <Typography variant="body2" color="textSecondary">
              {user.eMail}
            </Typography>
            <Box sx={{ m: 1 }} />
            <Button
              onClick={() => navigate(ERoute.SETTINGS)}
              variant="outlined"
              color="primary"
              size="medium"
            >
              {t("avatarMenu.editProfile")}
            </Button>
          </Box>
          <Box
            sx={{
              p: 1,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.grey[500]
            }}
          >
            <Button color="inherit" variant="text" size="small">
              <Icon path={mdiTag} size={0.75} />
              <Box sx={{ m: 0.5 }} />
              {t("avatarMenu.editOrganization")}
            </Button>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 2
            }}
          >
            <Tooltip title={<Box>{t("logout")}</Box>}>
              <Button
                onClick={() => {
                  userStore?.logout();
                  navigate(ERoute.ROOT);
                }}
                variant="text"
              >
                <Icon path={mdiLogoutVariant} size={1} />
                <Box sx={{ m: 0.5 }} />
                {t("logout")}
              </Button>
            </Tooltip>
          </Box>
          <Divider />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              p: 2
            }}
          >
            <Button
              variant="text"
              size="small"
              style={{
                color: indigo[500],
                textTransform: "none"
              }}
            >
              {t("avatarMenu.dataPrivacyStatement")}
            </Button>
            <Button
              variant="text"
              size="small"
              style={{
                color: indigo[500],
                textTransform: "none"
              }}
            >
              {t("avatarMenu.imprint")}
            </Button>
          </Box>
        </Menu>
      </div>
    );
  }
);
AvatarMenu.displayName = "AvatarMenu";

export default observer(AvatarMenu);
