# Copilot instructions — Unify Survey Bot

Full context is in `CLAUDE.md` at the repo root. Read it before any
non-trivial change. Summary of the rules that matter most:

## What this is

WhatsApp-based surveys. Admins build a survey here, share a `wa.me`
link, respondents answer inside WhatsApp, answers land in Supabase.

## Stack

Next.js 14 App Router · React 18 · TypeScript · Supabase · Meta
WhatsApp Cloud API. **Plain CSS only** — no Tailwind, no CSS modules,
no UI library. Do not introduce one.

## Critical context

The backend is real. The UI is not.

- `lib/survey-engine.ts`, `lib/whatsapp.ts`, `app/api/webhook/route.ts`,
  `app/api/surveys/route.ts` and `supabase/schema.sql` all work.
- **Every dashboard screen renders hardcoded mock arrays.** There are
  zero `fetch()` calls and zero `useEffect` hooks in `app/`.

The main task is replacing mock data with real Supabase queries. Look
for `mockSurveys`, `mockSurveysList`, `mockSurveyData`.

## Rules

1. **Never hardcode a hex colour in a component.** Use the CSS custom
   properties from `app/globals.css` (`var(--green)`,
   `var(--text-secondary)`, …). Palette changes must touch only that
   file.
   - Sole exception: the phone simulator in `surveys/new/page.tsx`
     deliberately uses WhatsApp's own colours.

2. **Reuse existing classes** — `.glass-card`, `.btn`, `.badge`,
   `.stat-card`, `.data-table`, `.form-input`, `.page-header` — before
   writing new inline styles.

3. **Do not change the state machine invariant.**
   `sessions.current_question_index` is a 1-based pointer to the *next*
   question to send. Answers are saved against `questions[index - 1]`.
   Breaking this silently misfiles every answer.

4. **Share links must be `START_<uuid>`.** The webhook strips `START_`
   and looks the remainder up as `surveys.id`, which is a uuid. The
   existing mock links (`START_ENGINEERING_2026`) are invalid.

5. **Do not loosen RLS.** It is already `using (true)` on every table,
   which is too permissive — tighten it, never widen it.

6. When adding a data-fetching screen, copy the pattern used by
   `/dashboard` once it is converted. Keep fetching consistent across
   screens.
