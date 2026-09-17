# Unify Survey Bot — Project Guide

Read this before changing anything. It records what is real, what is
fake, and the traps that are not obvious from the code.

## What this product is

Surveys that run **inside WhatsApp** instead of a web form.

1. An admin builds a survey in this dashboard.
2. They share a `wa.me` link.
3. The respondent answers inside WhatsApp using interactive buttons,
   list pickers, or free text. No browser, no login, no app install.
4. Answers land in Supabase and surface as analytics in the dashboard.

The whole pitch is completion rate: a WhatsApp thread gets finished far
more often than a link to a web form.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Supabase (Postgres) for storage
- Meta WhatsApp Cloud API for messaging
- **Plain CSS with design tokens.** No Tailwind, no CSS modules, no UI
  library. `recharts` is in `package.json` but is not imported anywhere.

## Architecture

```
WhatsApp user
   │  message
   ▼
app/api/webhook/route.ts     GET = Meta verification handshake
   │                         POST = inbound messages
   ▼
lib/survey-engine.ts         the state machine: reads session,
   │                         saves the previous answer, sends next Q
   ├──► lib/whatsapp.ts      Cloud API senders (text/buttons/list)
   └──► Supabase             sessions, responses, answers

Admin browser
   │
   ▼
app/(dashboard)/*            dashboard, surveys, new, [id], settings
   │                         ⚠️ currently 100% hardcoded mock data
   ▼
app/api/surveys/route.ts     GET list / POST create  ⚠️ nothing calls it
```

### The conversation state machine

`sessions.current_question_index` is a **1-based pointer to the next
question to send**, not the last one answered.

- `startSurvey` creates the session with index `1` and sends `questions[0]`.
- Each inbound message saves the answer for `questions[index - 1]`,
  then sends `questions[index]` and increments.
- When `index >= questions.length`, the survey is marked complete.

Preserve that invariant. Off-by-one here silently misfiles every answer
against the wrong question.

## Current state — read this carefully

| Area | State |
|---|---|
| Database schema | **Real.** `supabase/schema.sql` is complete and sound. |
| WhatsApp send helpers | **Real.** `lib/whatsapp.ts` |
| Conversation engine | **Real.** `lib/survey-engine.ts` |
| Webhook endpoint | **Real.** `app/api/webhook/route.ts` |
| Surveys API | **Real but orphaned.** `app/api/surveys/route.ts` works; no UI calls it. |
| All 6 dashboard screens | **Fake.** Hardcoded mock arrays. |
| Auth | **Not implemented.** Login page is a shell. |

There are **zero** `fetch()` calls and **zero** `useEffect` hooks in the
entire `app/` UI. Every number you see on screen — "487 responses",
"73.5%", "vs 28% Google Forms" — is a literal typed into JSX.

Mock data lives in:
- `app/(dashboard)/dashboard/page.tsx` → `mockSurveys`
- `app/(dashboard)/surveys/page.tsx` → `mockSurveysList`
- `app/(dashboard)/surveys/[id]/page.tsx` → `mockSurveyData`

**The main job is replacing these with real Supabase data.**

## Known traps

1. **`START_` links are broken.** The webhook parses
   `messageText.replace('START_', '')` and uses the result as
   `surveys.id`. But `surveys.id` is a **uuid**. The mock links say
   `START_ENGINEERING_2026`, which is not a uuid, so the lookup fails.
   Real share links must be `START_<actual-uuid>`.

2. **RLS is wide open.** Every policy in `schema.sql` is
   `for all using (true)`. Combined with the browser client in
   `lib/supabase.ts` (anon key), **any visitor can read every
   respondent's answers**. Tighten before this touches real data.

3. **`user_id` is never set.** `surveys.user_id` references
   `auth.users`, but `POST /api/surveys` does not populate it. Until
   auth is wired, every survey belongs to nobody and the dashboard
   cannot scope by owner.

4. **`.env.local` holds placeholders**, not credentials. Both API routes
   call `createClient(...)` at module scope with `!` assertions, so they
   will throw at import time until real values are set.

5. `app/(dashboard)/surveys/page.tsx` has an invalid style prop
   `justifyBetween: 'space-between'`. Not a real CSS property; it does
   nothing. Should be `justifyContent`.

## Styling rules

All styling flows through CSS custom properties defined at the top of
`app/globals.css`. Inline styles reference them as `var(--green)`,
`var(--text-secondary)`, etc.

**Never hardcode a hex colour in a component.** Add or reuse a token.
Changing the palette should require editing only `globals.css`.

Reusable classes already defined: `.glass-card`, `.btn` (`.btn-primary`,
`.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.btn-lg`),
`.badge` (`.badge-active`, `.badge-draft`, `.badge-closed`),
`.stat-card`, `.data-table`, `.form-input`, `.form-select`,
`.form-label`, `.page-header`, `.page-title`, `.stats-grid`,
`.empty-state`, `.animate-fade-up`.

Prefer these over new inline styles.

**One deliberate exception:** the phone simulator in
`app/(dashboard)/surveys/new/page.tsx` hardcodes WhatsApp's own colours
(`#0b141a`, `#202c33`, `#00a884`). That is correct — it is imitating
WhatsApp's UI and must not follow the app theme.

## Remaining work

Each screen currently renders mock data. Convert them in this order —
`dashboard` first, since it establishes the fetching pattern the rest
should copy.

1. **`/dashboard`** — replace `mockSurveys`; aggregate real counts.
2. **`/surveys`** — replace `mockSurveysList`; wire the filter tabs to
   real `status` values.
3. **`/surveys/new`** — `handlePublish` currently just `alert()`s. It
   must `POST /api/surveys` and redirect to the created survey.
4. **`/surveys/[id]`** — replace `mockSurveyData`; compute the answer
   breakdown per question from the `answers` table. Use the real
   `params.id` (it is read but ignored today).
5. **`/settings`** — `handleSave` only sets local state. Persist the
   credentials, or make it clearly read-only.
6. **`/login`** — implement Supabase auth, then set `user_id` on create
   and scope all queries by the signed-in user.

Also missing: a `GET/PATCH/DELETE /api/surveys/[id]` route. Only the
collection route exists.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node 18.17+. Fill in `.env.local` before expecting any API
route to work.

`preview/dashboard.html` is a dependency-free static mirror of the
dashboard for viewing the design without a server. It is **not** part of
the app and does not need to be kept in sync — delete it freely.
