# Bug Bounty Challenge — Resolution Report

This document records **all the actions taken** on the repository: getting the
project to run, the technical migration, the resolution of the requested bugs
and the extra features added.

---

## Running the project

> **Requirements:** Node 18+ and npm.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the login credentials

The login credentials are **not hardcoded** in the source anymore — they are
read from environment variables at build time. Copy the example file to `.env`
(and tweak the values if you want):

```bash
cp .env.example .env
```

`.env.example` ships with the working demo values:

```bash
VITE_DEMO_USER_EMAIL=linda.bolt@osapiens.com
VITE_DEMO_USER_PASSWORD=1234
```

Vite only exposes variables prefixed with `VITE_`, and inlines them into the
bundle **when the app is built/served** — they are consumed in
`src/api/services/User/store.ts` via `import.meta.env`. `.env` is gitignored;
`.env.example` is the tracked template.

### 3. Development server

```bash
npm run dev
```

Starts Vite's dev server on http://localhost:3000 (opens the browser
automatically).

### 4. Production build + preview

```bash
npm run build      # tsc -b && vite build  ->  outputs to build/
npm run preview    # serves the production build from build/
```

`npm run build` type-checks and produces the optimized bundle in `build/`.
`npm run preview` then boots a local static server with that exact bundle, so
you can verify the compiled app as it will be deployed.

### Login credentials

Use the values from your `.env` (the shipped demo defaults below):

| Field    | Value                     |
|----------|---------------------------|
| Email    | `linda.bolt@osapiens.com` |
| Password | `1234`                    |

---

## 1. Context and getting started

The original project was an application created with **CodeSandbox + Create
React App** on top of an already outdated stack. To be able to run it and work
on it in a maintainable way, two initial decisions were made:

1. **Downgrade Node to version 18** to get the original project to start.
2. Once it was running, a **full refactor / upgrade** was chosen: migration to
   **Vite** and an update of every dependency to current versions.

---

## 2. Technical migration

Summary of the structural changes to the project:

| Area | Before | After                                                   |
|------|--------|---------------------------------------------------------|
| Bundler / toolchain | Create React App (`react-scripts`) | **Vite 6** (`vite.config.ts`)                           |
| Entry point | `src/index.tsx` (`ReactDOM.render`) | `src/main.tsx` (`createRoot` + `StrictMode`)            |
| React | 17 | **19**                                                  |
| Router | `react-router-dom` v5 (`HashRouter`, `Switch`, legacy `matchPath`) | **v6** (`Router`, `<Routes>` / `<Route>`)               |
| State | MobX (`makeAutoObservable`) | **MobX-State-Tree** + `mst-persist`                     |
| UI | MUI 5 + `@mui/styles` (`StylesProvider`) | **MUI 9** + `StyledEngineProvider`                      |
| i18n | Manual locale loading | `import.meta.glob` + `i18next-browser-languagedetector` |
| TypeScript | 4.4 | **5.6** (config targeting `bundler` / `vite/client`)    |
| Quality | — | **ESLint + Prettier** configured                        |

Specific changes derived from the migration:

- Routing uses react-router v6's idiomatic `<Routes>` / `<Route>` tree, with
  `Root` as a layout route (`<Outlet/>`). Each page is loaded with
  `React.lazy(() => import(...))`, so every route ships in its own chunk and is
  only fetched when first visited (real code-splitting — see §7). The earlier
  hand-rolled `useMatchedRoute` hook (which rendered every route on each
  navigation) was removed.
- `App.tsx` keeps `HashRouter` (static-hosting friendly) with the v7 *future
  flags* enabled to avoid deprecation warnings.
- The debug `console.log(user)` in `Root` was removed.

---

## 3. Requested bugs (the ones listed on `Home`)

### 🐞 3.1 — `Warning: Each child in a list should have a unique "key" prop.`
**Cause:** in `Home`, the `.map()` over `issues` rendered `<ListItem>` without a
`key` prop.
**Fix:** added `key={index}` to the `ListItem`.
**Tests** (`src/pages/Home/Home.test.tsx`): a `console.error` spy asserts React's
*unique "key" prop* warning is never emitted, plus a structural check that all
five issues render as list items. (`react/jsx-key`, enabled via
`plugin:react/recommended`, is the static guarantee.)

### 🐞 3.2 — The word "known" must be shown in **bold** in the intro text
**Challenge constraint:** do not change the i18n text.
**Fix:** `{t("home.intro")}` was replaced with the `<Trans>` component from
`react-i18next` using `components={{ b: <b /> }}`, so the `<b>known</b>` embedded
in the translation string is rendered in bold **without altering the text** of
the locale files.
**Tests:** `src/i18n/locales.test.ts` locks the locale text (en/de keep
`<b>known</b>`, es keeps `<b>conocidos</b>`); `Home.test.tsx` asserts the word is
wrapped in a `<b>` element and tracks the active language (`known` in en/de,
`conocidos` in es).

### 🐞 3.3 — The user avatar is missing from the app bar
This item hid **two chained bugs** (exactly as the prompt warned: *"you might be
confronted with a second bug"*). Investigating against the initial code:

- **Root bug (typo):** in `api/services/User/store.ts`, the `getOwnUser` action
  assigned the result to `this.urser = result` (typo) instead of `this.user`.
  The user was therefore never stored, so `AppHeader` never received a
  `user.eMail` to render the `AvatarMenu`.

- **Second bug (hidden):** in `App.tsx`, the store provider was built as
  `value={new Store()}` **inside render**. That created a **new store instance
  on every render**; combined with `Root`'s `useEffect` depending on
  `[user, userStore]`, the store reference kept changing and the user state
  never settled.

**Fix:** when migrating to MobX-State-Tree, the store is instantiated **only
once** as a singleton (`const userStore = UserStore.create(...)`) and that same
instance is provided. The user-assignment flow was also fixed, and `AvatarMenu`
was wrapped in `observer` so it reacts to store changes.
**Tests:** `AvatarMenu.test.tsx` asserts the avatar color is always a valid
`rgb()` (never `rgb(NaN,…)`) for emoji/symbol/empty initials, and that applying a
user to the **singleton** store makes the avatar appear (proving the
observer/singleton fix) while logout clears it. `AppHeader.test.tsx` checks the
avatar shows only when a user has an email, otherwise the *Log in* link.
End-to-end: `e2e/avatar.spec.ts` (Playwright) logs in and verifies the avatar in
the real app bar.

### 🐞 3.4 (Optional) — Countdown breaks sometimes (hard to reproduce)
**Cause:** in `AppHeader`, the `setInterval` in the `useEffect` was **never
cleared**. In development (and especially with `StrictMode`, which mounts/
unmounts components) several overlapping intervals piled up, each incrementing
the counter at a different rate, which produced the erratic behavior.
**Fix:** the interval id is stored and cleaned up
(`return () => clearInterval(id)`), and the remaining time is derived from a
fixed start timestamp (`Date.now()`) rather than by accumulating ticks, so it
stays correct even when `setInterval` is throttled in a background tab.
**Tests** (`AppHeader.test.tsx`, fake timers + a controlled `Date.now`): the
interval is **cleared on unmount** (the actual regression) and not leaked across
remounts; the time is derived from the timestamp (a single tick after a 10s clock
jump shows 10s elapsed, not 1) and clamps at `00:00`.

### ⭐️ 3.5 (Optional) — Language switcher (English / German)
**Fix:** a `LanguageSwitcher` component was added to the app bar.
- The i18n setup loads **all locales** automatically via
  `import.meta.glob("./locales/*.json")`, so adding a language is just adding its
  JSON file.
- `i18next-browser-languagedetector` was integrated with **persistence in
  `localStorage`** (`detection.order: ["localStorage", "navigator"]`), so the
  chosen language is remembered across reloads and the browser language is used
  as a fallback when supported.
- Language labels are generated with `Intl.DisplayNames`.

**Tests:** `i18n.test.ts` checks the locales auto-load (`supportedLngs` =
en/de/es); `LanguageSwitcher.test.tsx` lists all languages, switches to German
and asserts the choice is cached in `localStorage["i18nextLng"]`. End-to-end:
`e2e/language.spec.ts` (Playwright) switches to Spanish and confirms it **survives
a real page reload**.

---

## 4. Extra features (beyond what was requested)

In addition to the challenge items, a complete session flow was added to give
the user store a purpose:

- **Login** (`/login`): a form that validates credentials against the store and
  handles loading and error states. The accepted credentials are no longer
  hardcoded — they come from `VITE_DEMO_USER_EMAIL` / `VITE_DEMO_USER_PASSWORD`
  in `.env` (see *Running the project* above; demo values:
  `linda.bolt@osapiens.com` / `1234`).
- **Logout**: actually implemented in the `AvatarMenu` (it used to be a
  `console.log("logout")`) and also available from the Login screen.
- **Settings** (`/user/settings`): editing the profile's first and last name.
  It is a **protected route** — authorization is route metadata (`requiresAuth`
  on the route), enforced by a generic `<ProtectedRoute>` guard that renders the
  `AccessDenied` screen when there is no session. `AccessDenied` offers a
  "Log in" button.
- **Local user persistence** with `mst-persist` (`whitelist: ["user"]`).
  > Note: it is persisted locally only to **demonstrate the use of
  > persistence**; in a production environment this would not make sense
  > (session data should not live only in `localStorage`). The unused
  > `getOwnUser` action was removed — creating a session now goes exclusively
  > through the Login flow.
- **Readme page** (`/readme`): renders this very document inside the app, linked
  from `Home` and from the header title.

---

## 5. Code quality

- **Prettier** configured (`.prettierrc.json`, `.prettierignore`) with `format`
  and `format:check` scripts.
- **ESLint** configured (`.eslintrc.cjs`) with `lint` and `lint:fix` scripts.
- Typing tightened during the React 19 / TS 5.6 migration
  (`PropsWithChildren`, `children: React.ReactNode`, route and param types,
  etc.). `noUnusedLocals` / `noUnusedParameters` are enabled, and errors are
  modeled as `Error` (no string rejections or `unknown`), which removed the
  `as ResultOrErrorResponse<...>` casts in the store.
- **Accessibility**: the avatar-menu trigger is a real `<IconButton>` with
  `aria-haspopup` / `aria-expanded` / keyboard support; the avatar background
  color is now a deterministic hash and can no longer produce `rgb(NaN,…)`.
- The duplicated `Login` / `Settings` CSS was merged into one shared stylesheet
  (`src/styles/auth.css`).
- **Testing**: every requested bug (§3) has a regression test, with **Vitest +
  React Testing Library** for unit/integration and **Playwright** for the two
  end-to-end flows. See §6 for the full breakdown.
- Various minor bugs fixed along the way during the migration.

---

## 6. Testing

Every requested bug in §3 has a regression test, so none of the fixes can
silently regress. Two layers:

- **Unit / integration** — **Vitest + React Testing Library + jsdom** (the same
  environment as the app). 30 tests across 7 files.
- **End-to-end** — **Playwright** (real Chromium) for the two flows that only a
  real browser can prove: login → avatar, and a language switch that survives a
  page reload.

### Running

```bash
npm test            # Vitest, run once (CI)
npm run test:watch  # Vitest, watch mode
npm run test:e2e    # Playwright (boots the dev server automatically)
```

> The unit suite runs on **Node 18**. The E2E suite uses Playwright ≥ 1.56, which
> requires **Node 20+**; one-time browser setup is
> `npx playwright install chromium`. `test:e2e` needs a `.env` (the demo
> credentials are inlined into the bundle).

### Coverage by bug

| Bug | Test file(s) | What it asserts |
|-----|--------------|-----------------|
| **3.1** key prop | `src/pages/Home/Home.test.tsx` | a `console.error` spy proves React's *unique "key" prop* warning never fires; all five issues render as list items (`react/jsx-key` is the static guard). |
| **3.2** bold "known" | `src/i18n/locales.test.ts`, `Home.test.tsx` | the locale text is unaltered (`<b>known</b>` in en/de, `<b>conocidos</b>` in es); the word renders inside a `<b>` and tracks the active language. |
| **3.3** avatar | `src/components/AvatarMenu/AvatarMenu.test.tsx`, `AppHeader.test.tsx`, `e2e/avatar.spec.ts` | the avatar color is always valid `rgb()` (never `rgb(NaN,…)`); applying a user to the **singleton** store makes the avatar appear (observer fix) and logout clears it; avatar vs. *Log in* link by auth state; E2E logs in and checks the real app bar. |
| **3.4** countdown | `src/components/AppHeader/AppHeader.test.tsx` | with fake timers + a controlled `Date.now`: the interval is **cleared on unmount** (the actual bug) and not leaked across remounts; time is timestamp-derived (one tick after a 10s jump shows 10s) and clamps at `00:00`. |
| **3.5** language switcher | `src/i18n/i18n.test.ts`, `src/components/LanguageSwitcher/LanguageSwitcher.test.tsx`, `e2e/language.spec.ts` | locales auto-load (`supportedLngs` = en/de/es); the menu lists every language, switches, and caches the choice in `localStorage["i18nextLng"]`; E2E confirms the choice **survives a real reload**. |

### Infrastructure

- **`src/test/test-utils.tsx`** — a shared `renderWithProviders(ui, { route?, withStore? })`
  helper that wraps components in the real `osapiens.light` theme, a `MemoryRouter`
  and (optionally) the singleton MST `StoreProvider`, mirroring the app's provider
  tree so components render exactly as they do in production.
- **`src/test/setup.ts`** — registers jest-dom matchers, initialises i18n, and
  resets shared singleton state (language + `localStorage`) after each test.
- Tests are **colocated** next to the code they cover; the pre-existing
  `src/utils/global.test.ts` (`resultOrError`) is kept.
- **`playwright.config.ts`** boots `npm run dev` as its `webServer`; specs live in
  `e2e/` and are excluded from the Vitest run.

---

## 7. Bundle size

- **Code-splitting**: every page is `React.lazy`-loaded, so it ships in its own
  chunk and is fetched on demand. In particular `react-markdown` (used by the
  Readme page) is no longer part of the initial bundle — it loads only when
  `/readme` is opened.
- **rollup-plugin-visualizer** is wired up (`npm run build:analyze`) to inspect
  chunk sizes.
- **Tree-shaking**: `lodash` is imported per-function (`lodash/merge`).
- State stays on **MobX-State-Tree** (a module-level singleton store); it was
  deliberately kept rather than swapped out.
- **mobx**: too heavy, zutsend implementend in another branch

---

## 8. AI used for

- **Translations** complete translation files and find text without translation
- **Document generation** this readme file
- **Mui Migration** mui usage changed
- **Test generation** the Vitest/RTL regression tests and the Playwright E2E
  specs for the §3 bugs (see §6), plus the shared `renderWithProviders` helper.

---


> Note: This document was generated with the assistance of an AI (Claude, by Anthropic).
