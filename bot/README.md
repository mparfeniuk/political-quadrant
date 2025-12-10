# Telegram Bot for Political Quadrant

Simple Telegraf-based bot that reuses the same questions and scoring logic as the web app.

## Features
- UA/EN language toggle.
- 30 questions (identical to the app), answers on a 1–5 scale.
- Nickname (optional, defaults to “Анонімний користувач” / “Anonymous”).
- Emoji avatar and optional slogan (<= 40 chars).
- Computes X (economic) and Y (social) scores and quadrant; shows a short description.
- Saves results to InstantDB.

## Prerequisites
- Node.js 20+ recommended.
- Env vars in `bot/.env`:
  - `BOT_TOKEN` — Telegram bot token from BotFather.
  - `INSTANT_DB_APP_ID` — InstantDB App ID.
  - `INSTANT_DB_CLIENT_KEY` — optional client key (if used in your project).

## Install & run locally (long polling)
```bash
cd bot
npm install
npm run dev   # hot reload via tsx
# or build + start
npm run build
npm start
```

## Deploy options
- Long polling on a Node host (Render/Railway/Fly/etc.).
- Webhook mode (Vercel/Cloudflare) is possible but requires exposing a public URL and wiring `bot.launch({ webhook: { ... }})` — not included in this minimal setup.

## Notes
- Bot imports questions and labels from `../src/data/questions.ts`. Keep that file in sync with the app.
- Saving uses InstantDB guest auth (`init({ appId, clientKey? })` + `signInAsGuest()` + `transact`).

