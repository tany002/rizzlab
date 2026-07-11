# RizzLab — Project Architecture

> AI-powered dating profile assessment SaaS. Users complete onboarding, pay via Razorpay, and receive a personalized "Rizz Score" report with photo, bio, style, and communication coaching.

**Last audited:** July 2026  
**Repository root:** `rizzlab/`

---

## Folder Structure

```
rizzlab/
├── .emergent/
│   └── emergent.yml              # Emergent platform job metadata (base image, job ID)
├── backend/
│   ├── server.py                 # Entire FastAPI application (single-file monolith)
│   ├── requirements.txt          # Python dependencies
│   ├── pytest.ini                # Pytest config (xdist parallel: -n 2 --dist loadscope)
│   └── tests/
│       └── test_webhook_regression.py  # Razorpay webhook + verify regression tests
├── frontend/
│   ├── public/
│   │   └── index.html            # HTML shell, Emergent badge, Google Fonts
│   ├── src/
│   │   ├── App.js                # Router + AuthProvider wrapper
│   │   ├── index.js              # React entry, React Query provider
│   │   ├── index.css             # Tailwind + CSS variables
│   │   ├── lib/
│   │   │   ├── api.js            # Axios client (withCredentials)
│   │   │   ├── auth.js           # AuthContext + session check
│   │   │   └── utils.js          # cn() helper (clsx + tailwind-merge)
│   │   ├── pages/                # Route-level page components
│   │   │   ├── Landing.jsx       # Conversion landing (Meta Ads traffic)
│   │   │   ├── Login.jsx         # Google OAuth entry
│   │   │   ├── AuthCallback.jsx  # OAuth session_id → cookie exchange
│   │   │   ├── Onboarding.jsx    # 6-step profile intake wizard
│   │   │   ├── Payment.jsx       # Razorpay Standard Checkout
│   │   │   ├── Analyzing.jsx     # Post-payment loading animation (/loading, /analyzing)
│   │   │   ├── Dashboard.jsx     # Report dashboard (tabs)
│   │   │   ├── SampleReport.jsx  # Public sample report preview
│   │   │   └── Premium.jsx       # ₹4,999 coaching upsell page
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui primitives (~40 components)
│   │   │   └── site/             # Navbar, Footer, Sidebar
│   │   ├── constants/testIds.js  # data-testid constants for E2E testing
│   │   └── hooks/use-toast.js
│   ├── plugins/
│   │   └── health-check/         # Optional webpack health plugin (ENABLE_HEALTH_CHECK)
│   ├── craco.config.js           # CRA override: aliases, visual edits, dev server
│   ├── tailwind.config.js        # Brand tokens (Outfit, Inter, #6D5EF7)
│   ├── components.json           # shadcn/ui config
│   ├── package.json
│   └── package-lock.json
├── memory/
│   └── PRD.md                    # Product requirements (may lag behind code)
├── test_reports/                 # Iteration test summaries (JSON)
├── test_result.md                # Agent testing protocol + state
├── auth_testing.md               # Manual auth testing playbook
├── design_guidelines.json        # Design system reference
└── README.md                     # Placeholder
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Create React App 5 + CRACO |
| **UI** | Tailwind CSS 3, shadcn/ui (Radix), Framer Motion, Lucide icons |
| **State / Data** | React Context (auth), TanStack React Query, Axios |
| **Backend** | FastAPI 0.110, Uvicorn 0.25 |
| **Database** | MongoDB via Motor (async) |
| **Auth** | Emergent-managed Google OAuth |
| **Payments** | Razorpay Standard Checkout (live keys in production) |
| **AI / LLM** | Not wired — mock report data only (Gemini planned) |
| **Testing** | pytest + pytest-xdist (backend), CRA test runner (frontend) |
| **Platform** | Emergent (build/deploy), Vercel (frontend, inferred from `.gitignore`) |

---

## Frontend Architecture

### Entry & Providers

```
index.js
  └── QueryClientProvider
        └── App.js
              └── AuthProvider (lib/auth.js)
                    └── BrowserRouter
                          └── AppRouter (routes)
                          └── Toaster (sonner)
```

### Routing

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/onboarding` | Onboarding | Soft (save fails silently if unauthenticated) |
| `/payment?plan=ai_review\|premium` | Payment | Yes (redirects to login) |
| `/loading`, `/analyzing` | Analyzing | No |
| `/dashboard` | Dashboard | Yes (redirects to login) |
| `/sample-report` | SampleReport | No |
| `/premium` | Premium | No |

**OAuth callback:** If URL hash contains `session_id=`, `AppRouter` renders `AuthCallback` before normal routing.

### Key Modules

- **`lib/api.js`** — Axios instance with `baseURL = REACT_APP_BACKEND_URL/api` and `withCredentials: true` for cookie auth.
- **`lib/auth.js`** — On mount, calls `GET /auth/me`. Exposes `{ user, loading, refresh, logout, setUser }`.
- **`pages/Payment.jsx`** — Loads Razorpay SDK dynamically, creates order server-side, verifies signature post-checkout, redirects to `/loading`.
- **`pages/Dashboard.jsx`** — Fetches `GET /report`, checks `unlocked` flag, renders tabbed report UI via `Sidebar`.

### UI System

- **shadcn/ui** components in `src/components/ui/` (New York style, CSS variables).
- **Design tokens:** brand purple `#6D5EF7`, Outfit headings, Inter body, surface `#FAFAFB`.
- **CRACO** adds `@/` path alias, optional Emergent visual-edits plugin in dev, webpack-dev-server v5 compatibility shim.

### Build Tooling

- Scripts: `craco start`, `craco build`, `craco test`
- Package manager declared as Yarn in `packageManager` field, but npm is also used locally (`package-lock.json` present).
- `resolutions` in `package.json` are Yarn-only; npm ignores them unless `overrides` are added.

---

## Backend Architecture

### Structure

The entire backend lives in a **single file**: `backend/server.py` (~685 lines).

```
FastAPI app
  └── api_router (prefix="/api")
        ├── /auth/*           Session management
        ├── /onboarding       Profile intake CRUD
        ├── /payments/*       Razorpay order, verify, webhook
        └── /report           Mock AI report generation
  └── CORSMiddleware (credentials + configurable origins)
```

### Auth Middleware Pattern

`get_current_user(request)` dependency:
1. Read `session_token` from cookie, or `Authorization: Bearer` header.
2. Look up `user_sessions` collection.
3. Validate expiry.
4. Load user from `users` collection.
5. Return `User` Pydantic model or raise 401.

`_get_optional_user(request)` wraps the above and returns `None` on failure (used for payment order creation).

### Report Generation

`build_mock_report(name)` returns a static JSON structure with scores, photo analysis, bio rewrite, style, communication, date plan, and 4-week roadmap. No LLM calls are made.

### Logging

Payment and webhook flows emit structured logs prefixed with `[payments]` and `[webhook]`.

---

## API List

Base URL: `{BACKEND_URL}/api`

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/session` | No | Exchange Emergent `session_id` for `session_token` cookie |
| `GET` | `/auth/me` | Yes | Return current user |
| `POST` | `/auth/logout` | No | Delete session, clear cookie |

### Onboarding

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/onboarding` | Yes | Upsert onboarding data for user |
| `GET` | `/onboarding` | Yes | Fetch onboarding data |

### Payments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/payments/create-order` | Optional | Create Razorpay order (₹299 or ₹4999) |
| `POST` | `/payments/verify` | Optional | HMAC signature verification after checkout |
| `POST` | `/payments/failure` | No | Record failed/dismissed payment |
| `GET` | `/payments/{order_id}` | No | Fetch payment record (signature excluded) |
| `POST` | `/payments/webhook` | Razorpay HMAC | Server-to-server webhook handler |

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/report` | Yes | User report (gated by `has_report`) |
| `GET` | `/sample-report` | No | Public demo report |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | `{ message: "RizzLab API", status: "ok" }` |

---

## Database Schema

MongoDB database name from `DB_NAME` env var. Collections:

### `users`

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | string | Primary key, e.g. `user_abc123` |
| `email` | string | Unique lookup key |
| `name` | string | Display name |
| `picture` | string | OAuth avatar URL |
| `created_at` | ISO datetime | |
| `has_report` | boolean | Unlocks full report (set on payment) |
| `payment_status` | string | `"active"` after payment |
| `subscription_status` | string | `"active"` after payment |
| `active_plan` | string | `"ai_review"` or `"premium"` |
| `last_payment_id` | string | Razorpay payment ID |
| `last_payment_source` | string | `"checkout_callback"` or `"webhook"` |
| `last_payment_at` | ISO datetime | |

### `user_sessions`

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | string | FK to users |
| `session_token` | string | Cookie value |
| `expires_at` | ISO datetime | 7-day TTL |
| `created_at` | ISO datetime | |

### `onboarding`

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | string | FK to users |
| `about` | object | age, city, occupation, goal, height, fitness, confidence |
| `challenges` | string[] | Selected pain points |
| `photos` | string[] | Base64 data URLs (not uploaded to object storage) |
| `profile` | object | bio, apps, interests, dealBreakers, personality |
| `style` | object | current style, budget, colors, grooming |
| `communication` | object | type, topics, experience |
| `updated_at` | ISO datetime | |

### `payments`

| Field | Type | Notes |
|-------|------|-------|
| `order_id` | string | Razorpay order ID (`order_*`) |
| `receipt` | string | Internal receipt ID |
| `user_id` | string \| null | May be null for guest orders |
| `email` | string \| null | |
| `plan` | string | `"ai_review"` or `"premium"` |
| `amount` | int | Rupees (299 or 4999) |
| `amount_paise` | int | Paise (amount × 100) |
| `currency` | string | `"INR"` |
| `status` | string | `created`, `paid`, `failed`, `verification_failed` |
| `payment_id` | string \| null | Razorpay payment ID |
| `signature` | string | Checkout signature (stored on verify) |
| `verified_via` | string | `"checkout_callback"` |
| `paid_via` | string | `"webhook"` |
| `paid_at` | ISO datetime | |
| `failed_at` | ISO datetime | |
| `failure_reason` | string | |
| `last_event` | string | Last webhook event name |
| `created_at` | ISO datetime | |

### `webhook_events`

| Field | Type | Notes |
|-------|------|-------|
| `event_id` | string | Razorpay event ID |
| `event` | string | e.g. `payment.captured` |
| `received_at` | ISO datetime | |
| `raw` | object | Full webhook payload |

---

## Authentication Flow

```
User clicks "Continue with Google" on /login
  │
  ▼
Redirect to https://auth.emergentagent.com/?redirect={origin}/dashboard
  │
  ▼
Google OAuth completes → redirect to /dashboard#session_id=...
  │
  ▼
AppRouter detects session_id in hash → renders AuthCallback
  │
  ▼
POST /api/auth/session { session_id }
  │
  ├── Backend calls Emergent auth service (X-Session-ID header)
  ├── Find or create user in MongoDB
  ├── Insert user_sessions record (7-day expiry)
  └── Set HttpOnly cookie: session_token (Secure, SameSite=None)
  │
  ▼
AuthCallback reads sessionStorage.postLoginRedirect (if set) → navigate there
  │
  ▼
AuthProvider.checkAuth() → GET /auth/me → user state populated
```

**Session transport:** HttpOnly cookie `session_token` (primary), or `Authorization: Bearer` header (testing).

**Logout:** `POST /auth/logout` deletes session from DB and clears cookie.

**Payment login redirect:** If unauthenticated user hits Pay on `/payment`, app stores `postLoginRedirect` in `sessionStorage` and sends user to `/login`. After OAuth, `AuthCallback` restores the payment URL.

**Known auth friction:** Google OAuth `redirect` URL is hardcoded to `/dashboard` in `Login.jsx`. The `postLoginRedirect` mechanism only works if the user returns via hash on a page that renders `AuthCallback` (typically `/dashboard#session_id=...`), not directly to `/payment`.

---

## Payment Flow

```
Authenticated user on /payment clicks "Pay ₹299 securely"
  │
  ▼
POST /api/payments/create-order { plan, amount }
  │
  ├── Create Razorpay order (server-side, amount in paise)
  ├── Store payment doc in MongoDB (status: "created")
  └── Return { order_id, amount, currency, key_id }
  │
  ▼
Open Razorpay Standard Checkout modal (checkout.js SDK)
  │
  ├── User completes UPI/Card payment
  └── Razorpay calls handler callback with { order_id, payment_id, signature }
  │
  ▼
POST /api/payments/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  │
  ├── HMAC-SHA256 verify: HMAC(order_id|payment_id, KEY_SECRET)
  ├── Update payments.status → "paid"
  ├── Backfill user_id from authenticated session if order was guest
  └── Activate user: has_report=true, payment_status=active, subscription_status=active
  │
  ▼
Frontend: toast success → navigate("/loading")
  │
  ▼
Analyzing page (~5.5s progress animation) → navigate("/dashboard")
  │
  ▼
GET /api/report → { unlocked: true, report: {...} }
```

### Webhook Fallback (server-to-server)

Razorpay sends events to `POST /api/payments/webhook`:
- Events handled: `payment.captured`, `payment.authorized`, `order.paid`, `payment.failed`
- Signature verified via `X-Razorpay-Signature` header + `RAZORPAY_WEBHOOK_SECRET`
- Idempotent: already-paid orders skip side effects
- Unknown events are recorded in `webhook_events` but do not error

### Plans

| Plan | Price | Query Param |
|------|-------|-------------|
| AI Rizz Score Report | ₹299 | `?plan=ai_review` |
| Premium Coaching | ₹4,999 | `?plan=premium` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name (e.g. `test_database`) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay public key (`rzp_live_*` or `rzp_test_*`) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Yes (prod) | Webhook HMAC secret from Razorpay dashboard |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `*`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_BACKEND_URL` | Yes | Backend base URL (no trailing slash) |
| `REACT_APP_RAZORPAY_KEY_ID` | No | Fallback Razorpay key if not returned by create-order |
| `ENABLE_HEALTH_CHECK` | No | Set `"true"` to enable webpack health plugin |
| `NODE_ENV` | Auto | `development` or `production` |

> All `.env` files are gitignored. Credentials must be configured per environment.

---

## Deployment Flow

### Emergent Platform (Primary)

The project was bootstrapped on Emergent (`fastapi_react_mongo_shadcn_base_image`):

1. **Backend** runs as a FastAPI/Uvicorn service (managed by supervisor in Emergent VM).
2. **Frontend** is served as a static CRA build or dev server.
3. **MongoDB** is provisioned as part of the Emergent stack.
4. Preview URL pattern: `https://match-prep-5.preview.emergentagent.com` (from test configs).

Backend logs (Emergent): `/var/log/supervisor/backend.err.log`

### Vercel (Frontend — Inferred)

- `.gitignore` includes `.vercel`, indicating Vercel deployment is used or planned.
- No `vercel.json` is present in the repo; Vercel likely uses default CRA build settings:
  - Build command: `npm run build` (or `craco build`)
  - Output directory: `build`
  - Requires `REACT_APP_BACKEND_URL` env var in Vercel dashboard.

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
# Configure backend/.env
uvicorn server:app --reload --port 8000

# Frontend
cd frontend
npm install --legacy-peer-deps   # currently required due to peer conflicts
# Configure frontend/.env
npm start                        # http://localhost:3000
```

---

## Known Issues

1. **Frontend dependency conflicts** — React 19 is incompatible with `react-scripts@5` and `react-day-picker@8`. ESLint 9 conflicts with CRA's bundled ESLint 8. `npm install` fails without `--legacy-peer-deps` on a clean install. Vercel builds may fail for the same reason.

2. **Guest payment orders** — Backend `create-order` still allows unauthenticated orders (`user_id: null`). Frontend now requires login, but API-level guest orders remain possible via direct API calls.

3. **OAuth redirect mismatch** — Google login redirect is hardcoded to `/dashboard`. Users paying from `/payment` depend on `sessionStorage.postLoginRedirect`, which only works if OAuth returns to a page that renders `AuthCallback`.

4. **Mock AI report** — `/report` returns static mock data regardless of onboarding input. No Gemini/vision integration despite dependencies being present in `requirements.txt`.

5. **Photo storage** — Onboarding photos are stored as base64 data URLs in MongoDB. No S3/object storage, no size limits enforced server-side.

6. **Webhook secret placeholder** — `RAZORPAY_WEBHOOK_SECRET` may still be a dev placeholder; production webhooks will fail signature verification until updated.

7. **Email login not implemented** — Login page shows email form but displays "coming soon" toast.

8. **Onboarding save is soft-fail** — If user completes onboarding without being logged in, save is skipped silently and flow continues to payment.

9. **Razorpay prefill uses dummy data** — Payment checkout pre-fills `test@rizzlab.app` / `9999999999` instead of authenticated user's real contact info.

10. **Report always returned** — `/report` returns full report JSON even when `unlocked: false`; frontend uses the flag for UI gating only.

11. **PRD is stale** — `memory/PRD.md` describes "mock Razorpay" but codebase has live Razorpay integration.

12. **npm vs yarn mismatch** — `package.json` declares Yarn as package manager and uses `resolutions` (Yarn-only), but `package-lock.json` exists for npm. Resolution pins do not apply under npm.

---

## Technical Debt

| Area | Issue | Severity |
|------|-------|----------|
| **Backend structure** | Entire API in single 685-line `server.py` | Medium |
| **Auth guards** | No centralized `ProtectedRoute`; per-page ad-hoc checks | Medium |
| **Dependency versions** | React 19 + CRA 5 + ESLint 9 stack is unstable | High |
| **Package manager** | Yarn resolutions + npm lockfile coexist | Medium |
| **AI integration** | LLM deps installed but unused; report is hardcoded mock | High |
| **File uploads** | Base64 in MongoDB instead of object storage | Medium |
| **FastAPI lifecycle** | Uses deprecated `@app.on_event("shutdown")` | Low |
| **Test coverage** | Backend has Razorpay regression tests; no frontend unit/E2E tests in CI | Medium |
| **Security** | CORS defaults to `*`; no rate limiting on payment endpoints | Medium |
| **Observability** | Console logs only; no structured logging, APM, or error tracking | Medium |
| **Analytics** | No PostHog/funnel tracking (listed in PRD backlog) | Low |
| **Accessibility** | No a11y audit; shadcn components provide baseline only | Low |
| **Internationalization** | Hardcoded INR/English only | Low |
| **Dead dependencies** | `@tanstack/react-query`, `swr`, `dayjs`, `recharts` partially or unused | Low |

---

## User Journey (End-to-End)

```
Landing (/) ──CTA──► Payment (/payment)
                         │
                    [Login required]
                         │
                    Login (/login) ──Google OAuth──► AuthCallback
                         │
                    Payment (/payment) ──Razorpay──► Loading (/loading)
                         │
                    Dashboard (/dashboard) ──unlocked report──► Full report tabs

Alternative paths:
  Landing ──► Onboarding (/onboarding) ──► Payment
  Landing ──► Sample Report (/sample-report) [public demo]
  Navbar ──► Premium (/premium) ──► Payment?plan=premium
```

---

## External Services

| Service | Purpose | URL / SDK |
|---------|---------|-----------|
| Emergent Auth | Google OAuth | `https://auth.emergentagent.com/` |
| Emergent Auth API | Session exchange | `https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data` |
| Razorpay | Payment processing | `https://checkout.razorpay.com/v1/checkout.js` |
| MongoDB | Primary database | Connection via `MONGO_URL` |
| Unsplash | Demo photo URLs in mock report | CDN URLs in `build_mock_report()` |

---

## Testing

### Backend

```bash
cd backend
pytest tests/test_webhook_regression.py
```

Covers: webhook signature verification, event dispatch, idempotency, `/payments/verify` HMAC, live order creation.

### Manual Auth Testing

See `auth_testing.md` for MongoDB session seeding and cookie-based browser testing.

### Frontend

No automated test suite configured. Manual verification documented in `test_reports/iteration_*.json`.

---

*This document reflects the codebase as audited. Update when making architectural changes.*
