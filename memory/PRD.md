# RizzLab / DateCoach — PRD

## Original Problem Statement
Build DateCoach (now rebranded landing → RizzLab) — an AI-powered dating assessment SaaS. First iteration: Full landing + onboarding + dashboard with mock AI data, Emergent Google Auth, mock Razorpay checkout, INR pricing.

## Landing Rebuild (Feb 2026)
Rebuilt Landing.jsx from scratch as **RizzLab** — a single-purpose conversion landing page optimized for Meta Ads traffic. All landing CTAs route directly to `/payment?plan=ai_review`.

## User Personas
- Male, 18-27, uses Bumble/Hinge/Tinder
- Low confidence, not getting matches
- Mobile-first, short attention span
- Willing to pay ₹299 for immediate answers

## Core Architecture
- Frontend: React 19 + Tailwind + Framer Motion + shadcn/ui
- Backend: FastAPI + MongoDB (Motor)
- Auth: Emergent-managed Google OAuth (cookie: `session_token`)
- LLM: Emergent LLM key available (not wired yet — mock data)
- Payment: Mock Razorpay flow

## Implemented (v1)
- ✅ Landing (RizzLab conversion-focused, animated dashboard, blurred report preview)
- ✅ Login (Emergent Google OAuth + email placeholder)
- ✅ AuthCallback (session_id → cookie exchange)
- ✅ Onboarding (6 steps: About, Challenges, Photos, Profile, Style, Communication)
- ✅ Payment (mock Razorpay: UPI/Card/Wallet)
- ✅ Analyzing (dark premium terminal loader)
- ✅ Dashboard (sidebar + tabs: Overview/Photos/Bio/Style/Communication/Date Plan/Roadmap)
- ✅ SampleReport (public preview)
- ✅ Premium (₹4,999 human coaching page)
- ✅ Backend API: /auth/*, /onboarding, /payments/*, /report, /sample-report

## Backlog (Prioritized)
### P0
- Wire real Gemini 3 Flash vision for photo analysis
- Wire real Gemini for bio rewrite
- Real Razorpay integration (production keys)

### P1
- A/B test landing headline variants
- Analytics + PostHog funnel tracking
- Photo upload validation (min resolution, face detection)
- Email report delivery

### P2
- Weekly progress emails
- Coach booking calendar (Premium)
- WhatsApp support integration
- Referral / share your score card

## Dates
- 2026-02-06 — MVP built + first landing (DateCoach)
- 2026-02-06 — Landing rebuilt as RizzLab conversion page
