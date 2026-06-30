import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";

const Readme = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/Readme.md")
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <Box sx={{ height: "100%", overflow: "auto", p: 2 }}>
      <Container>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            margin: 0
          }}
        >
          {content}
        </pre>
      </Container>
    </Box>
  );
};

export default observer(Readme);
