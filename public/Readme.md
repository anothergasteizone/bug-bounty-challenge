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

| Area | Before | After |
|------|--------|-------|
| Bundler / toolchain | Create React App (`react-scripts`) | **Vite 6** (`vite.config.ts`) |
| Entry point | `src/index.tsx` (`ReactDOM.render`) | `src/main.tsx` (`createRoot` + `StrictMode`) |
| React | 17 | **19** |
| Router | `react-router-dom` v5 (`HashRouter`, `Switch`, legacy `matchPath`) | **v6** (`HashRouter`, `<Routes>` / `<Route>`) |
| State | MobX (`makeAutoObservable`) | **MobX-State-Tree** + `mst-persist` |
| UI | MUI 5 + `@mui/styles` (`StylesProvider`) | **MUI 9** + `StyledEngineProvider` |
| i18n | Manual locale loading | `import.meta.glob` + `i18next-browser-languagedetector` |
| TypeScript | 4.4 | **5.6** (config targeting `bundler` / `vite/client`) |
| Quality | — | **ESLint + Prettier** configured |

Specific changes derived from the migration:

- Routing uses react-router v6's idiomatic `<Routes>` / `<Route>` tree, with
  `Root` as a layout route (`<Outlet/>`). Each page is loaded with
  `React.lazy(() => import(...))`, so every route ships in its own chunk and is
  only fetched when first visited (real code-splitting — see §6). The earlier
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

### 🐞 3.2 — The word "known" must be shown in **bold** in the intro text
**Challenge constraint:** do not change the i18n text.
**Fix:** `{t("home.intro")}` was replaced with the `<Trans>` component from
`react-i18next` using `components={{ b: <b /> }}`, so the `<b>known</b>` embedded
in the translation string is rendered in bold **without altering the text** of
the locale files.

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

### 🐞 3.4 (Optional) — Countdown breaks sometimes (hard to reproduce)
**Cause:** in `AppHeader`, the `setInterval` in the `useEffect` was **never
cleared**. In development (and especially with `StrictMode`, which mounts/
unmounts components) several overlapping intervals piled up, each incrementing
the counter at a different rate, which produced the erratic behavior.
**Fix:** the interval id is stored and cleaned up
(`return () => clearInterval(id)`), and the remaining time is derived from a
fixed start timestamp (`Date.now()`) rather than by accumulating ticks, so it
stays correct even when `setInterval` is throttled in a background tab.

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
- **Testing infrastructure**: **Vitest + React Testing Library + jsdom**
  (`test` / `test:watch` scripts, `src/test/setup.ts`), with an initial unit
  test for `resultOrError`.
- Various minor bugs fixed along the way during the migration.

---

## 6. Bundle size

- **Code-splitting**: every page is `React.lazy`-loaded, so it ships in its own
  chunk and is fetched on demand. In particular `react-markdown` (used by the
  Readme page) is no longer part of the initial bundle — it loads only when
  `/readme` is opened.
- **rollup-plugin-visualizer** is wired up (`npm run build:analyze`) to inspect
  chunk sizes.
- **Tree-shaking**: `lodash` is imported per-function (`lodash/merge`).
- State stays on **MobX-State-Tree** (a module-level singleton store); it was
  deliberately kept rather than swapped out.

---

## 7. AI used for

- **Translations** complete translation files and find text without translation
- **Document generation** this readme file
- **Mui Migration** mui usage changed

---

> Note: This document was generated with the assistance of an AI (Claude, by Anthropic).
