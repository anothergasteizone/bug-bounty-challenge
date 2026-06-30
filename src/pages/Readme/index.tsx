import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import Markdown from "react-markdown";

const Readme = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/Readme.md")
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 2 }}>
      <Container
        sx={{
          "& h1, & h2, & h3": { mt: 3, mb: 1 },
          "& p": { mb: 1.5, lineHeight: 1.6 },
          "& ul, & ol": { pl: 3, mb: 1.5 },
          "& li": { mb: 0.5 },
          "& code": {
            px: 0.5,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: "rgba(0, 0, 0, 0.06)",
            fontFamily: "monospace"
          },
          "& pre": {
            p: 2,
            borderRadius: 1,
            backgroundColor: "rgba(0, 0, 0, 0.06)",
            overflow: "auto"
          },
          "& pre code": { backgroundColor: "transparent", p: 0 },
          "& a": { color: "primary.main" },
          "& img": { maxWidth: "100%" }
        }}
      >
        <Markdown>{content}</Markdown>
      </Container>
    </Box>
  );
};

export default observer(Readme);
