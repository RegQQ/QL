# Telegram QR Login Deployment

The Telegram QR login cannot work from `localhost` for real users. A phone and Telegram's servers need a public HTTPS URL for the webpage and webhook.

## Deploy

Deploy this Next.js app to a public host such as Vercel, Netlify, Railway, Render, or your own HTTPS server.

Set these environment variables on the deployed app:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://your-public-domain.com

TELEGRAM_BOT_USERNAME=qltrade_bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

`NEXT_PUBLIC_APP_URL` must be the live public origin. Do not use `http://localhost:3000`.

## Database

Run the Supabase migration:

```bash
supabase/migrations/002_telegram_allowed_users.sql
```

## Configure Telegram

After deployment, run this command with the production env vars loaded:

```bash
npm run telegram:webhook
```

That registers:

```text
https://your-public-domain.com/api/telegram/webhook
```

Then users open:

```text
https://your-public-domain.com/telegram-login
```

Scanning the QR opens `@qltrade_bot`. When the user presses Start, the webhook marks the Telegram account as an allowed user automatically.
