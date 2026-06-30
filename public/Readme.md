# Bug Bounty Challenge — Resolution Report

This document records **all the actions taken** on the repository: getting the
project to run, the technical migration, the resolution of the requested bugs
and the extra features added.

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
| Router | `react-router-dom` v5 (`HashRouter`, `Switch`, legacy `matchPath`) | **v6** (`BrowserRouter`, new `matchPath` API) |
| State | MobX (`makeAutoObservable`) | **MobX-State-Tree** + `mst-persist` |
| UI | MUI 5 + `@mui/styles` (`StylesProvider`) | **MUI 6** + `StyledEngineProvider` |
| i18n | Manual locale loading | `import.meta.glob` + `i18next-browser-languagedetector` |
| TypeScript | 4.4 | **5.6** (config targeting `bundler` / `vite/client`) |
| Quality | — | **ESLint + Prettier** configured |

Specific changes derived from the migration:

- `useMatchedRoute` was rewritten for react-router v6's new `matchPath` API
  (`{ path, end, caseSensitive }`), and the `Switch` / `Route` render-props were
  removed and replaced with transitions controlled via the `in` prop.
- `App.tsx` moves from `HashRouter` to `BrowserRouter` with the v7 *future
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
**Fix:** the interval id is stored and the cleanup function
`return () => clearInterval(id)` is returned from the `useEffect`.

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

- **Login** (`/login`): a form that validates credentials against the store
  (`linda.bolt@osapiens.com` / `1234`) and handles loading and error states.
- **Logout**: actually implemented in the `AvatarMenu` (it used to be a
  `console.log("logout")`) and also available from the Login screen.
- **Settings** (`/user/settings`): editing the profile's first and last name.
  It is a **protected route** — `Root` flags `accessDenied` when accessed
  without a session and shows the `AccessDenied` screen, which was rewritten to
  offer a "Log in" button.
- **Local user persistence** with `mst-persist` (`whitelist: ["user"]`).
  > Note: it is persisted locally only to **demonstrate the use of
  > persistence**; in a production environment this would not make sense
  > (session data should not live only in `localStorage`). Note also that
  > `getOwnUser` no longer auto-loads a *hardcoded* user on startup (it resolves
  > `undefined`): creating a session now goes through the Login flow.
- **Readme page** (`/readme`): renders this very document inside the app, linked
  from `Home` and from the header title.

---

## 5. Code quality

- **Prettier** configured (`.prettierrc.json`, `.prettierignore`) with `format`
  and `format:check` scripts.
- **ESLint** configured (`.eslintrc.cjs`) with `lint` and `lint:fix` scripts.
- Typing tightened during the React 19 / TS 5.6 migration
  (`PropsWithChildren`, `children: React.ReactNode`, route and param types,
  etc.).
- Various minor bugs fixed along the way during the migration.

---

## 6. Bundle size

- **rollup-plugin-visualizer** Used to analyze
- **tree-shaking** applied to some libraries like lodash
- **Mobx** fully refactored, but to heavy, decide to change it with Zustand

---

## 7. AI used for

- **Translations** complete translation files and find text without translation
- **Document generation** this readme file
- **Mui Migration** mui usage changed

---

> Note: This document was generated with the assistance of an AI (Claude, by Anthropic).
