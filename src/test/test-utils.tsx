import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { osapiens } from "../themes";
import { StoreProvider } from "../api/services/User";

interface ProviderOptions extends Omit<RenderOptions, "wrapper"> {
  /** Initial router entry. Defaults to "/". */
  route?: string;
  /** Wrap in the real MST StoreProvider (singleton). Defaults to false. */
  withStore?: boolean;
}

/**
 * Render a component with the same providers the app relies on:
 * - the real `osapiens.light` theme (components read `theme.tokens.header.height`),
 * - a `MemoryRouter` (AvatarMenu uses `useNavigate`, AppHeader uses `<Link>`),
 * - optionally the singleton `StoreProvider` (for store-reactivity tests).
 *
 * i18n needs no provider: importing `../i18n` (done in `setup.ts`) initialises the
 * singleton and `initReactI18next` wires it globally.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: ProviderOptions = {}
) {
  const { route = "/", withStore = false, ...rtlOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const tree = (
      <ThemeProvider theme={osapiens.light}>
        <MemoryRouter
          initialEntries={[route]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          {children}
        </MemoryRouter>
      </ThemeProvider>
    );
    return withStore ? <StoreProvider>{tree}</StoreProvider> : tree;
  };

  return render(ui, { wrapper: Wrapper, ...rtlOptions });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { default as i18n } from "../i18n";
