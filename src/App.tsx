import { Suspense } from "react";
import { SnackbarProvider } from "notistack";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import RootComponent from "./pages/Root/index";
import { osapiens } from "./themes";
import "./i18n";
import { StoreProvider as UserStoreProvider } from "./api/services/User";
import { HashRouter as Router } from "react-router-dom";

const theme = osapiens.light;

const AppContainer = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <UserStoreProvider>
        <SnackbarProvider maxSnack={3}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              {/* Inside ThemeProvider so CssBaseline picks up the theme overrides. */}
              <CssBaseline />
              <Router
                future={{
                  // Deprecation warning.
                  v7_startTransition: true,
                  v7_relativeSplatPath: true
                }}
              >
                <RootComponent />
              </Router>
            </ThemeProvider>
          </StyledEngineProvider>
        </SnackbarProvider>
      </UserStoreProvider>
    </Suspense>
  );
};

export default AppContainer;
