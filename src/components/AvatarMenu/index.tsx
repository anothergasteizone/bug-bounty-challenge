import { observer } from "mobx-react";
import { mdiLogoutVariant, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import {
  Avatar,
  Box,
  Button,
  Divider,
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
      .map((_) => (_ && _[0] ? _[0].toLocaleUpperCase() : _ ?? ""))
      .join("");
    return initials;
  }
  return "";
};

const stringAvatar = (user: UserInfo) => {
  const initials = getInitials(user);
  // 36 * 7 <= 255
  const r = Math.floor(parseInt(initials[0] ? initials[0] : "k", 36) * 7);
  const g = Math.floor(parseInt(initials[1] ? initials[1] : "l", 36) * 7);
  const b = Math.floor(
    parseInt(user?.firstName?.[1] ? user.firstName[1] : "m", 36) * 7
  );
  return {
    sx: { bgcolor: `rgb(${r},${g},${b})`, cursor: "pointer" },
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
        <Avatar onClick={handleClick} {...stringAvatar(user)} />
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
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
            <Button
              color="inherit"
              variant="text"
              size="small"
            >
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
