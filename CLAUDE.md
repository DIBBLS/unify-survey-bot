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
- Supabase (Postgres + Auth) for storage and dashboard login
- Meta WhatsApp Cloud API for messaging
- Deploys to **Vercel** (zero-config for Next.js — no plugin or build settings needed)
- **Plain CSS with design tokens.** No Tailwind, no CSS modules, no UI
  library. `recharts` is in `package.json` but is not imported anywhere —
  the charts on `/dashboard` are hand-built CSS bars.

## Architecture

```
WhatsApp user
   │  message
   ▼
app/api/webhook/route.ts     GET = Meta verification handshake
   │                         POST = inbound messages (signature-checked,
   │                         deduped against processed_messages,
   │                         rate-limited per phone number)
   ▼
lib/survey-engine.ts         the state machine: reads session,
   │                         saves the previous answer, sends next Q
   ├──► lib/whatsapp.ts      Cloud API senders (text/buttons/list)
   └──► Supabase             sessions, responses, answers
                              (service-role key — bypasses RLS by design)

Admin browser
   │  signs in via Supabase Auth (middleware.ts protects everything below)
   ▼
app/(dashboard)/*            server components, query Supabase directly
   │                         via lib/queries.ts, scoped by the signed-in
   │                         user's session (RLS enforces ownership too)
   ▼
app/api/surveys/route.ts     GET list / POST create — called by
app/api/surveys/[id]/route.ts    surveys/new's publish flow (client component)
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
| Database schema | **Real.** `supabase/schema.sql`, RLS scoped by `auth.uid()`. |
| WhatsApp send helpers | **Real.** `lib/whatsapp.ts` |
| Conversation engine | **Real.** `lib/survey-engine.ts` |
| Webhook endpoint | **Real**, signature-verified, idempotent (dedupes retried deliveries by WhatsApp message id — see `processed_messages`), and rate-limited per phone number (see `webhook_rate_limits`). `app/api/webhook/route.ts` |
| Auth | **Real.** Supabase Auth (email/password), `middleware.ts` protects `/dashboard`, `/surveys`, `/settings`. |
| Surveys API | **Real**, auth-scoped. `app/api/surveys/route.ts` (list/create) + `[id]/route.ts` (get/patch/delete). |
| All 6 dashboard screens | **Real.** Server components pulling live Supabase data via `lib/queries.ts`. |

Every number on screen is computed from real rows — there is no mock data
left in `app/`. Aggregation logic (per-question breakdowns, completion
rates, avg completion time) lives in `lib/queries.ts`; formatting helpers
(`timeAgo`, `maskPhone`, `whatsAppLink`) live in `lib/format.ts`.

**A subtlety worth knowing before touching `lib/queries.ts`:** only
`choice`-type answers get an `answers.option_id`. `yes_no` answers are
stored as `text_answer` `'yes'`/`'no'` (the raw WhatsApp button id — no
`options` row exists for yes/no questions), and `rating` answers are
stored as `text_answer` `'1'`–`'5'` (the raw list-reply id). Group by the
wrong column for a given question type and the breakdown silently reads
as all-zero.

## Known traps

1. **`WHATSAPP_NUMBER` and `WHATSAPP_PHONE_NUMBER_ID` are two different
   values from the Meta console — don't swap them.** The first is the
   public WhatsApp number and builds the `wa.me` links respondents
   click; the second is the internal id the Cloud API uses to send
   messages. Mixing them up produces working `wa.me` links that open a
   different WhatsApp number than the one the bot listens on.
   `WHATSAPP_NUMBER` has no `NEXT_PUBLIC_` prefix on purpose — it's only
   ever read server-side, so it doesn't need to be bundled into client
   JS (even though the number itself is already public in every link).

2. **`.env.local` holds placeholders in a fresh checkout.** See
   `.env.example` for the full list. Until real Supabase + Meta values
   are set, the app renders but every Supabase call fails (pages degrade
   to empty/error states rather than crashing — this is by design, not
   a bug to fix).

3. **New Supabase projects require the schema to be run once**: paste
   `supabase/schema.sql` into the SQL editor before anything will work,
   including sign-up (the `surveys` table's RLS policies reference
   `auth.uid()`, which only resolves once a session exists — signing up
   itself doesn't need the schema, but creating a survey does). If you
   already ran an earlier version of this file, re-running the whole
   thing will fail on the first `create table` (relation already
   exists) — apply just the new statements by hand instead (both the
   `processed_messages` and `webhook_rate_limits` tables are written
   with `if not exists` for exactly this reason; the older tables
   aren't, so don't re-paste the full file over an existing project).

4. **No production hardening beyond RLS, webhook signature checks,
   delivery-retry idempotency, and a per-phone-number rate limit.** The
   idempotency guard (`processed_messages`) dedupes Meta's own retried
   deliveries of the *same* message; the rate limit (`webhook_rate_limits`,
   checked in `lib/survey-engine.ts`) separately caps how fast one sender
   can drive DB writes + outbound WhatsApp sends. Neither defends against
   a flood of *distinct* forged requests (already moot: those fail
   signature verification before touching the DB at all). Also not
   implemented: WhatsApp's 24-hour session-messaging window / message
   templates for re-engaging respondents after that window closes, or
   multi-admin support per workspace (one Supabase Auth user = one owner
   of their surveys, no sharing).

## Styling rules

This app follows the **Unify brand kit** — the same design tokens as the
main Unify product (Playfair Display for display type, DM Sans for body,
a single green accent used surgically, no purple/blue accent hues). All
styling flows through CSS custom properties defined at the top of
`app/globals.css`. Inline styles reference them as `var(--green)`,
`var(--text-muted)`, etc. See `globals.css` for the full token list
(`--bg`, `--surface`, `--surface-2`, `--border`, `--border-strong`,
`--text`, `--text-muted`, `--text-subtle`, `--green` family, `--tag-bg`,
spacing/radius/shadow scales).

**Never hardcode a hex colour in a component.** Add or reuse a token.
Changing the palette should require editing only `globals.css`.

**No per-card accent colours.** Stat cards, badges, and charts do not
assign a different hue per item (no purple/blue/amber-as-decoration) —
green is the only accent, used for genuinely positive/active states.
Big numbers (`.stat-value`) are always near-black, not colour-coded.

Reusable classes already defined: `.glass-card`, `.hero-banner` (dark
inverted banner for page intros), `.wordmark` (brand logotype — `Unify`
followed by `<span class="dot">.</span>`), `.btn` (`.btn-primary`,
`.btn-hero`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`,
`.btn-lg`), `.badge` (`.badge-active`, `.badge-draft`, `.badge-closed`),
`.stat-card`, `.data-table`, `.form-input`, `.form-select`,
`.form-label`, `.page-header`, `.page-title`, `.stats-grid`,
`.empty-state`, `.animate-fade-up`.

Prefer these over new inline styles.

**One deliberate exception:** the phone simulator in
`app/(dashboard)/surveys/new/page.tsx` hardcodes WhatsApp's own colours
(`#0b141a`, `#202c33`, `#00a884`). That is correct — it is imitating
WhatsApp's UI and must not follow the app theme.

## Remaining work

The build-out described in earlier versions of this doc (real auth, real
data on every screen, RLS, webhook signature verification) is done. What's
genuinely left, in rough priority order for taking this to real users:

1. **Message templates / 24-hour window.** Meta only allows free-form
   messages within 24 hours of the user's last message. A respondent who
   goes quiet mid-survey and comes back later needs a template message
   to be re-engaged — not built.
2. **Multi-admin workspaces.** Right now one Supabase Auth user owns
   their surveys outright; there's no concept of inviting a co-founder
   to the same workspace.
3. **Cross-sender volumetric rate limiting on `app/api/webhook/route.ts`.**
   Signature verification stops forged requests, `processed_messages`
   stops a retried delivery from being reprocessed, and
   `webhook_rate_limits` caps how fast any *one* phone number can drive
   the endpoint — none of these stop a high-volume flood spread across
   many *distinct*, validly-signed senders.
4. **Editing survey questions after publish.** `PATCH /api/surveys/[id]`
   now has a UI (title/description/status — see `SurveyEditPanel`), but
   there's still no way to edit questions after a survey has responses
   (arguably correct — changing questions under live respondents would
   corrupt the `current_question_index` invariant — but worth a
   deliberate decision rather than silent omission).

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node 18.17+. Copy `.env.example` to `.env.local` and fill in
real values before expecting anything beyond the login page to work:

1. Create a Supabase project, paste `supabase/schema.sql` into its SQL
   editor, and copy the URL + anon key + service role key.
2. In Supabase Auth settings, disable "Confirm email" while testing
   locally (or check your inbox after signing up).
3. Create a Meta app with the WhatsApp product, grab the phone number
   id, access token, and app secret, and pick a `WHATSAPP_VERIFY_TOKEN`.
4. Set `WHATSAPP_NUMBER` to the actual WhatsApp number (digits only)
   respondents will message — not the phone number id.

**Deploying to Vercel:** import the repo at vercel.com — it auto-detects
Next.js, no build settings to touch. Set every variable from
`.env.example` in Project settings → Environment Variables (use the real
deployed URL for `NEXT_PUBLIC_SITE_URL`), then point the Meta webhook
config at `https://<your-project>.vercel.app/api/webhook` (the exact
value is also shown on the `/settings` page once deployed).
