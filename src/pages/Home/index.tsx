import { Box, Container, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { observer } from "mobx-react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation("app");
  const theme = useTheme();
  const issues = [
    { icon: "🐞", key: "consoleKey" },
    { icon: "🐞", key: "boldKnown" },
    { icon: "🐞", key: "avatarMissing" },
    { icon: "🐞", key: "countdown" },
    { icon: "⭐️", key: "languageSwitch" }
  ];

  return (
    <Box
      sx={{
        p: 2,
        maxHeight: `calc(100vh - ${theme.tokens.header.height})`,
        overflow: "auto"
      }}
    >
      <Container>
        <Typography variant="h1" sx={{ textAlign: "center" }}>
          {t("home.welcome")}
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center" }}>
          <Trans i18nKey="home.intro" ns="app" components={{ b: <b /> }}>
            This is a demo application with some glitches and bugs, where we
            hope that you can finde them. 😃 Here the list of <b>known</b>{" "}
            issues:
          </Trans>
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ textAlign: "center" }}
        >
          {t("home.sidenote")}
        </Typography>
        <Typography>
          <Link to={"/readme"}>{t("home.goToReadme")}</Link>
        </Typography>
        <List>
          {issues.map((issue, index) => (
            <ListItem key={index}>
              <Typography variant="h5" sx={{ p: 2 }}>
                {issue.icon}
              </Typography>
              <ListItemText
                primary={t(`home.issues.${issue.key}.title`)}
                secondary={t(`home.issues.${issue.key}.description`)}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default observer(Home);
