import { Button, MenuItem, ListItemText } from "@mui/material";
import Menu from "@mui/material/Menu";
import React from "react";
import { useTranslation } from "react-i18next";

import {supportedLngs} from "../../i18n";

interface Language {
  code: string;
  label: string;
}

const Index: React.FC = () => {
  const { i18n, t } = useTranslation("app");


  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames([i18n.language], { type: "language" });
  } catch {
    displayNames = null;
  }

  const LANGUAGES: Language[] = supportedLngs.map((code) => ({
    code,
    label: displayNames?.of(code) ?? code
  }));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === i18n.language) ?? LANGUAGES[0];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelect = (code: string) => {
    i18n.changeLanguage(code).then(() => handleClose());
  };

  return (
    <>
      <Button
        onClick={handleClick}
        color="inherit"
        variant="text"
        size="small"
        aria-label={t("changeLanguage")}
      >
        <span style={{ marginLeft: 8 }}>{currentLanguage?.label}</span>
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={lang.code === currentLanguage?.code}
            onClick={() => handleSelect(lang.code)}
          >
            <ListItemText>{lang.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
export default Index;
