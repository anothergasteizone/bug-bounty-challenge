import { Box, Container, Typography } from "@mui/material";
import { observer } from "mobx-react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation("app");
  const issues = [
    {
      icon: "🐞",
      title:
        'Console error: Warning: Each child in a list should have a unique "key" prop.',
      description:
        "Hope you are able to find what is causing this error, as it is annoying."
    },
    {
      icon: "🐞",
      title:
        'The word "known" should be displayed bold in the introduction text.',
      description:
        "When implementing a solution, please ensure to not change the i18n text."
    },
    {
      icon: "🐞",
      title:
        "User avatar in app bar is missing, although user should be fetched on app start correctly.",
      description:
        "On app start we load the current user object via a MobX store, but for any reason the user avatar is not displayed in the top right of the app bar. Attention: When solving this issue, you might will be confronted with a second bug."
    },
    {
      icon: "🐞",
      title: "Optional: Countdown is broken sometimes (hard to reproduce).",
      description:
        "Some developers mentioned that the countdown in the app header behaves strange sometimes, but unfortunately they were not able to reproduce this glitch reliably, maybe you find the root cause."
    },
    {
      icon: "⭐️",
      title: "Optional: It would be great to be able to switch the language.",
      description:
        "Please add a language select control in the app bar to swicth the UI language between english and german."
    }
  ];

  return (
    <Box
      sx={{ p: 2, maxHeight: "calc(100vh - 64px)", overflow: "auto" }}
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
          <Link to={"/readme"}>Go to readme</Link>
        </Typography>
        <List>
          {issues.map((issue, index) => (
            <ListItem key={index}>
              <Typography variant="h5" sx={{ p: 2 }}>
                {issue.icon}
              </Typography>
              <ListItemText
                primary={issue.title}
                secondary={issue.description}
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default observer(Home);
