import { mdiAlert } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { observer } from "mobx-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ERoute } from "../../types/global";
import "../Login/index.css";

const AccessDenied: React.FC = () => {
  const { t } = useTranslation("app");
  const theme = useTheme();
  const navigate = useNavigate();

  const color = theme.palette.error.main;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        p: 3
      }}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          textAlign: "center",
          width: "100%",
          maxWidth: 320
        }}
      >
        <Icon size={2} color={color} path={mdiAlert} />
        <Typography variant="h5" sx={{ color }}>
          {t("AccessDenied")}
        </Typography>
        <Typography color="text.secondary">{t("speakToYourAdmin")}</Typography>
        <button
          type="button"
          onClick={() => navigate(ERoute.LOGIN)}
          className="login-button"
        >
          {t("login")}
        </button>
      </Stack>
    </Box>
  );
};

export default observer(AccessDenied);
