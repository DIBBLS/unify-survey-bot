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
| Auth | **Real.** Supabase Auth — email/password, Google OAuth, and forgot-password — `middleware.ts` protects `/dashboard`, `/surveys`, `/settings`. |
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

0. **If the bot goes quiet (messages deliver on WhatsApp but nothing ever
   replies), it is almost never the code.** This exact failure happened
   and took a long time to track down. In order of likelihood, check:

   a. **Meta → your app → WhatsApp → Configuration page → Webhook.**
      The Callback URL and Verify token fields are **not** filled in by
      default, even after you've generated an access token and grabbed
      the Phone Number ID on the API Setup page — those are a separate
      page from this one. If Callback URL / Verify token are blank (or
      "Verify and save" was never clicked and confirmed), Meta has
      nowhere to send events, full stop, regardless of anything else
      being correct. Callback URL = `https://<your-domain>/api/webhook`,
      Verify token = whatever you set `WHATSAPP_VERIFY_TOKEN` to.
   b. **Same Configuration page, scroll down to "Webhook fields."**
      Every field defaults to **Unsubscribed**, including `messages`.
      A correctly-filled-in, verified Callback URL does *not* auto-subscribe
      you to any event type. You must find the row literally labeled
      `messages` and flip its toggle to Subscribed — that's the one that
      carries inbound text/button/list replies. (The other `message_*`
      rows — `message_echoes`, `message_template_*` — are for different
      things; leave those alone.)
   c. **The WABA-to-app subscription** (separate from b — this is an
      API-level thing, not a dashboard toggle). Check via Meta's Graph
      API Explorer: `GET /<WABA_ID>/subscribed_apps` with your access
      token. An empty `"data": []` means the app was never subscribed to
      that WhatsApp Business Account and nothing will ever arrive; `POST`
      to the same path (no body) to subscribe. In practice this one was
      already fine when checked, but it's cheap to rule out and has been
      a documented, known Meta gotcha for other people's setups.
   d. **`WHATSAPP_ACCESS_TOKEN` may have expired.** The token generated
      from the API Setup page's "Generate access token" button is
      **temporary — about 24 hours.** If the bot worked yesterday and
      is silent today with no config changes, this is the first thing
      to check. `lib/whatsapp.ts` logs a `WhatsApp send failed (HTTP ...)`
      line with Meta's actual error body when a send fails (see Vercel
      Logs, filtered to `/api/webhook`) — an expired token shows up
      there clearly now instead of failing silently. Generate a
      **permanent token** via a System User (Business Settings → System
      Users) before this goes in front of real users; don't leave it on
      the 24-hour one.
   e. **Signature verification failing** — wrong `WHATSAPP_APP_SECRET`
      on Vercel. Shows as `Webhook signature verification failed` in
      Vercel Logs.

   The webhook route and `lib/whatsapp.ts` both have real diagnostic
   logging now (added after chasing this exact issue) — if the bot ever
   goes quiet again, Vercel Logs should say *why*, not just nothing.

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

**Dark mode is real**, not just a design-token stub. Default is "auto"
(`@media (prefers-color-scheme: dark)`); an explicit `data-theme="dark"`
or `data-theme="light"` attribute on `<html>` overrides it.
`components/ThemeToggle.tsx` is the toggle button (sun/moon icon,
wired into `Topbar` and the login page) — it reads/writes
`localStorage.theme` and flips the attribute. `app/layout.tsx` has a
blocking inline script that applies the stored theme before first
paint, so there's no flash of the wrong theme on load. When adding a
new token to `globals.css`, check `tokens.json` in the brand kit for
its dark value too — most tokens differ between themes (a few, like
`--green` and `--near-black`, are intentionally identical in both).

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

## Account ownership (read this before touching infra)

The project migrated off its original Supabase + Vercel accounts after
the original Supabase project was accidentally deleted. Current state:

- **Supabase** — new project, owned by the company email, not the
  original personal account. Don't create another new project; this
  one is the live one.
- **Vercel** — likewise a fresh project under the company email. The
  old personal-account Vercel project still exists but is no longer
  deployed to — don't update env vars there, they do nothing now.
- **Meta / WhatsApp Cloud API — still on the original personal Facebook
  account.** This was never migrated. Two ways to fix that without
  redoing the whole Cloud API setup (phone number, access token, app
  secret, webhook subscription) from scratch:
  - Add a second Admin to the app directly (App Dashboard → App Roles →
    Add People) using their own Facebook login — quickest, no migration.
  - Move the app into a Meta Business Manager (business.facebook.com)
    so it's owned by a business entity instead of one person's account,
    then add people as Business Manager Admins. More proper long-term,
    more setup. Either way, the App ID, phone number, access token, and
    webhook config stay exactly as they are — only *who can manage it*
    changes.
  - Whoever ends up owning this: the current access token is the
    **temporary ~24-hour one** — see Known trap 0(d). Generate a
    permanent System User token before this is relied on day to day.
- **GitHub** — shared normally, more than one person already has push
  access to this repo.

A product requirements doc (`WhatsApp Survey Bot — PRD.docx`,
`prd-dump.txt`) lives in the repo root.

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
5. **For Google sign-in to work**: Supabase Dashboard → Authentication
   → Providers → Google → enable it, then paste in a Client ID and
   Secret from a Google Cloud Console OAuth consent screen + credential
   (Authorized redirect URI there is
   `https://<project-ref>.supabase.co/auth/v1/callback` — the *Supabase*
   callback, not this app's `/auth/callback`, which is a separate,
   later hop). No env vars in this repo for it — the credentials live
   only in Supabase's own config. Without this step the button is
   there but every attempt fails.
6. **For forgot-password and Google sign-in to redirect back correctly**:
   Supabase Dashboard → Authentication → URL Configuration → add this
   app's `/auth/callback` URL (both the deployed one and
   `http://localhost:3000/auth/callback` for local dev) to Redirect
   URLs, and set Site URL to the deployed URL. Without this, Supabase
   silently refuses the redirect after a real recovery-link click or
   Google auth, even though everything up to that point looked fine.

**Deploying to Vercel:** import the repo at vercel.com — it auto-detects
Next.js, no build settings to touch. Set every variable from
`.env.example` in Project settings → Environment Variables (use the real
deployed URL for `NEXT_PUBLIC_SITE_URL`), then point the Meta webhook
config at `https://<your-project>.vercel.app/api/webhook` (the exact
value is also shown on the `/settings` page once deployed).
