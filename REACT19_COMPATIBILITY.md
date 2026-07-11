# RizzLab — React 19 Compatibility Audit

**Date:** July 9, 2026  
**Scope:** `frontend/package.json` + `frontend/package-lock.json`  
**Constraint:** Keep `react@19.0.0` and `react-dom@19.0.0` (no downgrade)  
**Method:** Peer dependency inspection from lockfile + npm registry metadata (`npm view`). No installs performed.

---

## Executive Summary

| Category | Count |
|----------|-------|
| Direct dependencies audited | 56 (43 prod + 13 dev) |
| **Hard React 19 peer conflicts** | **1** |
| React 19–compatible direct deps | 55 |
| Packages used in app code with conflicts | 1 (`react-day-picker` via `calendar.jsx`) |

The **only direct dependency that explicitly rejects React 19** in its peer dependency range is:

> **`react-day-picker@8.10.1`** — peer: `react@^16.8.0 || ^17.0.0 || ^18.0.0`

This is the root cause of `npm install` / Vercel `ERESOLVE` failures when React 19 is declared at the project root. All other React-facing libraries in this project either include `^19` in their peer range or do not declare a React peer at all.

---

## Hard Incompatible Packages

### 1. `react-day-picker`

| Field | Value |
|-------|-------|
| **Current version** | `8.10.1` |
| **Declared in** | `package.json` → `dependencies` |
| **Used in app** | `src/components/ui/calendar.jsx` (shadcn Calendar wrapper) |
| **Runtime usage today** | Calendar component exists but is **not imported by any page**; only Lucide `Calendar` icon is used in `Premium.jsx` |

**Reason for incompatibility**

Published peer dependencies for `8.10.1`:

```json
{
  "react": "^16.8.0 || ^17.0.0 || ^18.0.0",
  "date-fns": "^2.28.0 || ^3.0.0"
}
```

React 19 is outside the declared peer range. npm 7+ treats this as a fatal `ERESOLVE` conflict on clean installs (no `--legacy-peer-deps`).

**Latest React 19–compatible options**

| Target version | React 19 peer | date-fns requirement | Upgrade safety |
|----------------|---------------|----------------------|----------------|
| **`8.10.2`** | `^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` | `^2.28.0 \|\| ^3.0.0` | **Safe** — patch release, no API changes |
| **`9.0.0`** | `>=16.8.0` | `^3.6.0` (matches current `date-fns@^3.6.0`) | **Breaking** — v9 API, styling, and shadcn calendar rewrite |
| **`9.1.0` – `9.14.0`** | `>=16.8.0` | `^4.1.0` | **Breaking** — v9 API + requires `date-fns@4` |
| **`10.0.1`** (latest) | `>=16.8.0` | `^4.1.0` (dependency) | **Breaking** — v9/v10 API; upstream recommends `@daypicker/react` for new projects |

**Recommended fix:** `8.10.2` (minimal, preserves existing shadcn v8 calendar code).

---

## Soft / Ecosystem Risks (Not Hard React 19 Peer Conflicts)

These packages do **not** declare React 19 as incompatible, but create friction in a React 19 + CRA stack.

### 2. `react-scripts@5.0.1`

| Field | Value |
|-------|-------|
| **Current version** | `5.0.1` |
| **Peer dependency** | `react: ">= 16"` (accepts 19) |
| **Status** | Officially **deprecated** (Feb 2025); maintenance mode only |

**Why it matters with React 19**

- CRA was sunset; React team published guidance to migrate to Vite/Next/Parcel.
- Bundles **ESLint 8**, **Jest 27**, and webpack 5 tooling from 2021–2022.
- Fresh CRA scaffolds historically failed with React 19 due to **transitive** `@testing-library/react@13` (React 18 only). This project does **not** currently lock `@testing-library/react` in `package-lock.json`, so the conflict is latent until tests are added.
- Builds can work with React 19 (this repo has produced successful `craco build` output), but the toolchain is unmaintained long-term.

| Upgrade path | Safety |
|--------------|--------|
| Stay on `5.0.1` + fix peer conflicts elsewhere | Safe short-term |
| Migrate to **Vite + `@vitejs/plugin-react`** | Breaking (build system change) |
| `react-scripts@5.1.0-next.*` (pre-release only on npm) | Risky — not stable |

**Verdict:** Peer-compatible with React 19, but **ecosystem-incompatible** for long-term React 19 support.

---

### 3. `eslint@9.23.0` (devDependency)

| Field | Value |
|-------|-------|
| **Current version** | `9.23.0` |
| **React peer** | None |
| **Conflict** | `eslint-config-react-app@7.0.1` (bundled inside `react-scripts`) requires `eslint@^8.0.0` |

**Not a React 19 issue**, but blocks strict `npm install` alongside CRA. Listed here because it surfaces during the same dependency resolution pass as the React 19 audit.

| Fix | Safety |
|-----|--------|
| Remove root `eslint@9` and use CRA's bundled ESLint 8 | Safe |
| Keep ESLint 9 only if decoupled from `react-scripts` lint pipeline | Requires config migration |

---

### 4. `date-fns@^3.6.0`

| Field | Value |
|-------|-------|
| **Current version** | `^3.6.0` (resolved in lockfile) |
| **React peer** | None |

**Not incompatible with React 19.** Becomes relevant only if upgrading `react-day-picker` to `9.1.0+` or `10.x`, which require `date-fns@^4.1.0`.

| If upgrading day-picker to… | date-fns action |
|----------------------------|-----------------|
| `8.10.2` | Keep `date-fns@^3.6.0` |
| `9.0.0` | Keep `date-fns@^3.6.0` |
| `9.1.0+` / `10.x` | Upgrade to `date-fns@^4.1.0` (**breaking** API changes in date-fns v4) |

---

## Compatible Packages

All packages below are **compatible with React 19** based on declared peer dependencies and/or absence of React peer constraints.

### Core React

| Package | Version | React peer / notes |
|---------|---------|-------------------|
| `react` | `19.0.0` | Target runtime |
| `react-dom` | `19.0.0` | Target runtime |

### Routing & data fetching

| Package | Version | React peer |
|---------|---------|------------|
| `react-router-dom` | `7.15.0` | `react >=18`, `react-dom >=18` |
| `react-router` (transitive) | `7.15.0` | `react >=18` |
| `@tanstack/react-query` | `5.56.2` | `react ^18 \|\| ^19` |
| `swr` | `2.3.8` | `react ^16.11 \|\| ^17 \|\| ^18 \|\| ^19` |

### UI & animation

| Package | Version | React peer |
|---------|---------|------------|
| `framer-motion` | `11.18.0` | `react ^18 \|\| ^19`, `react-dom ^18 \|\| ^19` |
| `lucide-react` | `0.516.0` | `react ^16.5 \|\| ^17 \|\| ^18 \|\| ^19` |
| `sonner` | `2.0.3` | `react ^18 \|\| ^19`, `react-dom ^18 \|\| ^19` |
| `next-themes` | `0.4.6` | `react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19` |
| `cmdk` | `1.1.1` | `react ^18 \|\| ^19`, `react-dom ^18 \|\| ^19` |
| `vaul` | `1.1.2` | `react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19`, `react-dom` same |
| `input-otp` | `1.4.2` | `react ^16.8 \|\| … \|\| ^19.0.0-rc`, `react-dom` same |
| `embla-carousel-react` | `8.6.0` | `react ^16.8 \|\| … \|\| ^19.0.0 \|\| ^19.0.0-rc` |
| `react-resizable-panels` | `3.0.1` | `react ^16.14 \|\| … \|\| ^19.0.0`, `react-dom` same |
| `recharts` | `3.6.0` | `react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19`, `react-dom` same |

### Forms

| Package | Version | React peer |
|---------|---------|------------|
| `react-hook-form` | `7.56.2` | `react ^16.8 \|\| ^17 \|\| ^18 \|\| ^19` |
| `@hookform/resolvers` | `5.0.1` | Peers `react-hook-form ^7.55` (no direct React peer) |

### Radix UI / shadcn primitives (all `@radix-ui/react-*`)

All 27 Radix packages at their pinned versions declare:

```
react: ^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc
react-dom: (same)
```

**Compatible.** Includes: accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip.

### Build tooling (dev)

| Package | Version | React 19 notes |
|---------|---------|----------------|
| `@craco/craco` | `7.1.0` | Peers `react-scripts ^5.0.0` only; no React peer |
| `@babel/plugin-proposal-private-property-in-object` | `7.21.11` | Babel plugin; no React peer |
| `ajv` | `^8.17.1` | JSON schema; no React peer (fixes CRA/webpack ajv mismatch) |
| `autoprefixer`, `postcss`, `tailwindcss`, `dotenv` | pinned | No React peer |
| `eslint-plugin-react` | `7.37.4` | Supports React 19 JSX runtime |
| `eslint-plugin-react-hooks` | `5.2.0` | Supports React 19 |
| `eslint-plugin-jsx-a11y`, `eslint-plugin-import` | pinned | No React version peer |
| `@eslint/js`, `globals` | pinned | No React peer |
| `@types/lodash` | `4.17.24` | Types only |
| `@emergentbase/visual-edits` | tarball URL | Peer deps not published on npm registry; loaded only in dev via CRACO |

### Non-React dependencies (no peer conflict)

| Package | Version |
|---------|---------|
| `axios` | `1.16.0` |
| `class-variance-authority` | `0.7.1` |
| `clsx` | `2.1.1` |
| `date-fns` | `^3.6.0` |
| `dayjs` | `1.11.13` |
| `lodash` | `4.18.1` |
| `tailwind-merge` | `3.2.0` |
| `tailwindcss-animate` | `1.0.7` |
| `zod` | `3.24.4` |
| `cra-template` | `1.2.0` |

### Transitive highlights (from lockfile)

| Package | Version | React peer |
|---------|---------|------------|
| `react-redux` (via recharts) | `9.3.0` | `react ^18 \|\| ^19` |
| All `@radix-ui/react-*` transitive | various | Include `^19.0` |

---

## Upgrade Path

### Path A — Minimal (recommended first)

Fix the only hard peer conflict without API changes.

```
react-day-picker: 8.10.1 → 8.10.2
date-fns:           ^3.6.0 (unchanged)
react / react-dom:  19.0.0 (unchanged)
```

**Expected outcome:** Strict `npm install` succeeds. No calendar code changes required.

**Code changes:** None (unless adding `react-day-picker` CSS import, which is not present today).

---

### Path B — Modernize calendar (shadcn v9 alignment)

Align with current shadcn/ui calendar template.

```
react-day-picker: 8.10.1 → 9.0.0
date-fns:           ^3.6.0 (unchanged)
```

**Code changes required:**

- Rewrite `src/components/ui/calendar.jsx` to shadcn v9 DayPicker API
- Replace v8 `components={{ IconLeft, IconRight }}` with v9 `Chevron` component API
- Update `classNames` keys (v9 renamed several slot class keys)
- Add CSS import: `react-day-picker/style.css` (or equivalent)

**Safety:** Breaking for calendar UI only. Low blast radius today because no page imports `Calendar`.

---

### Path C — Latest day-picker + date-fns v4

```
react-day-picker: 8.10.1 → 9.14.0 (or 10.0.1)
date-fns:           ^3.6.0 → ^4.1.0
```

**Additional breaking changes:**

- `date-fns` v4 API changes affect any direct `date-fns` imports (none found in `src/` today)
- `react-day-picker` v9.1+ bundles `date-fns@^4` as a dependency
- v10 recommends migrating package name to `@daypicker/react` long-term

**Safety:** Breaking. Only justified if adopting latest DayPicker features.

---

### Path D — Long-term build toolchain (outside React 19 peer scope)

```
react-scripts 5.0.1 → Vite 6 + @vitejs/plugin-react
eslint 9 → standalone flat config (decoupled from CRA)
```

**Safety:** Large breaking change. Not required to resolve the React 19 peer conflict, but recommended for sustained React 19 maintenance after Path A.

---

## Breaking Changes Reference

### `react-day-picker` 8 → 8.10.2

| Change | Impact |
|--------|--------|
| Peer dependency expanded to include React 19 | None at runtime |
| No API changes | None |

### `react-day-picker` 8 → 9

| Change | Impact |
|--------|--------|
| Custom `components` API redesigned (`IconLeft`/`IconRight` removed) | Must update `calendar.jsx` |
| `classNames` slot keys renamed | Must update Tailwind class map |
| Default styling moved to `react-day-picker/style.css` | Must add CSS import |
| `date-fns` becomes a direct dependency of the package | v9.0.0 uses v3; v9.1+ uses v4 |
| Accessibility and selection mode props refined | Review any future calendar usage |

### `date-fns` 3 → 4

| Change | Impact |
|--------|--------|
| ESM-first packaging | May affect CRA/webpack resolution |
| Function signature and import path changes | Audit any `date-fns` imports before upgrading |
| Required when using `react-day-picker >= 9.1.0` | Coupled upgrade |

### `react-scripts` 5 (CRA)

| Change | Impact |
|--------|--------|
| Deprecated, no active maintainers | Security/tooling drift |
| Bundled ESLint 8 conflicts with root ESLint 9 | Separate from React 19; fix by removing ESLint 9 or migrating off CRA |

---

## Recommended Migration Order

| Step | Action | Risk | Blocks install? |
|------|--------|------|-----------------|
| **1** | Bump `react-day-picker` `8.10.1` → **`8.10.2`** | Low | **Yes** — fixes ERESOLVE |
| **2** | Regenerate `package-lock.json` with strict `npm install` | Low | Validates fix |
| **3** | Run `npm run build` and smoke-test payment/auth flows | Low | Validates runtime |
| **4** | Resolve **ESLint 9 vs CRA ESLint 8** (remove root ESLint 9 or pin to 8.x) | Medium | Yes (separate from React 19) |
| **5** | Remove unused `ajv@^8` devDependency if CRA ajv conflict is resolved by step 1–2 | Low | Optional cleanup |
| **6** | (Optional) Upgrade `calendar.jsx` to `react-day-picker@9.0.0` + shadcn v9 template | Medium | No — not blocking |
| **7** | (Optional) Upgrade to `react-day-picker@9.14+` + `date-fns@4` | High | No |
| **8** | (Future) Migrate `react-scripts` → Vite | High | No — strategic |

---

## Dependency Tree Diagram

```
react@19.0.0
├── ✅ @radix-ui/react-* (27 packages)     peer: includes ^19
├── ✅ react-router-dom@7.15.0             peer: >=18
├── ✅ @tanstack/react-query@5.56.2        peer: ^18 || ^19
├── ✅ framer-motion@11.18.0               peer: ^18 || ^19
├── ✅ react-hook-form@7.56.2              peer: includes ^19
├── ✅ sonner, cmdk, vaul, input-otp, …    peer: includes ^19
├── ❌ react-day-picker@8.10.1             peer: ^16 || ^17 || ^18 ONLY
│       └── date-fns@^3.6.0                (no React peer; OK)
├── ⚠️  react-scripts@5.0.1                peer: >=16 (OK) but deprecated
│       ├── eslint@8.x (bundled)
│       ├── jest@27
│       └── eslint-config-react-app → eslint@^8
└── ⚠️  eslint@9.23.0 (dev, root)          conflicts with CRA eslint@8, not React 19
```

---

## Verification Checklist (for when changes are applied)

After implementing Step 1–3 from the migration order:

- [ ] `npm install` completes without `--legacy-peer-deps` or `--force`
- [ ] `npm run build` succeeds on Vercel-equivalent clean environment
- [ ] No `ERESOLVE` errors mentioning `react-day-picker`
- [ ] Payment flow (`/payment` → Razorpay → `/loading` → `/dashboard`) works
- [ ] Auth flow (Google OAuth → session cookie) works
- [ ] If calendar is ever wired into UI, visually verify `Calendar` component after any day-picker upgrade

---

## Sources

- `frontend/package.json` — declared dependencies
- `frontend/package-lock.json` — resolved peer dependency metadata
- npm registry: `npm view react-day-picker@<version> peerDependencies`
- [React: Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app)
- [react-day-picker issue #2719](https://github.com/gpbl/react-day-picker/issues/2719) — React 19 + v8 peer conflict
- [daypicker.dev changelog](https://daypicker.dev/changelog) — v9.4.3 React 19 compatibility, v8.10.2 peer expansion

---

*Audit complete. No files were modified. Awaiting implementation approval.*
