# Unify Survey Bot

Surveys that run **inside WhatsApp** instead of a web form — no browser,
no login, no app install for the respondent.

**Live:** https://unify-survey-bot-seven.vercel.app

## How it works

1. An admin builds a survey in the dashboard.
2. They share a `wa.me` link.
3. The respondent answers inside WhatsApp, using interactive buttons,
   list pickers, or free text.
4. Answers land in Supabase and surface as analytics in the dashboard.

The pitch is completion rate: a WhatsApp thread gets finished far more
often than a link to a web form.

## Stack

- Next.js 14 (App Router), React 18, TypeScript
- Supabase (Postgres + Auth)
- Meta WhatsApp Cloud API
- Deployed on Vercel
- Plain CSS with design tokens — no Tailwind, no CSS modules, no UI library

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node 18.17+. Copy `.env.example` to `.env.local` and fill in
real Supabase + Meta values — beyond the login page, nothing works
until you do.

## Documentation

**[`CLAUDE.md`](./CLAUDE.md)** has everything else: full architecture,
the conversation state machine, known traps (including the WhatsApp
webhook configuration gotchas that are easy to lose an afternoon to),
styling rules, and who currently owns the Supabase/Vercel/Meta
accounts. Read it before touching infrastructure or auth.
