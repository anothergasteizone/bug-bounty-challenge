import { SnackbarProvider } from "notistack";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Root from "./pages/Root";
import ProtectedRoute from "./components/ProtectedRoute";
import { routes } from "./pages/routes";
import { osapiens } from "./themes";
import "./i18n";
import { StoreProvider as UserStoreProvider } from "./api/services/User";

const theme = osapiens.light;

// routes[0] is the landing page (Home) by construction; used for "/" and
// the catch-all so unknown paths fall back to it.
const HomeComponent = routes[0].Component;

const AppContainer = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          {/* Inside ThemeProvider so CssBaseline picks up the theme overrides. */}
          <CssBaseline />
          {/* Inside ThemeProvider so the hydration spinner is themed. */}
          <UserStoreProvider>
            <Router
              future={{
                // Deprecation warning.
                v7_startTransition: true,
                v7_relativeSplatPath: true
              }}
            >
              <Routes>
                <Route element={<Root />}>
                  <Route index element={<HomeComponent />} />
                  {routes.map(({ path, Component, requiresAuth }) =>
                    requiresAuth ? (
                      <Route key={path} element={<ProtectedRoute />}>
                        <Route path={path} element={<Component />} />
                      </Route>
                    ) : (
                      <Route key={path} path={path} element={<Component />} />
                    )
                  )}
                  <Route path="*" element={<HomeComponent />} />
                </Route>
              </Routes>
            </Router>
          </UserStoreProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </SnackbarProvider>
  );
};

export default AppContainer;
