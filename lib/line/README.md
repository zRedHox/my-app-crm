# LINE integration (this app)

## Flow

```
LINE Platform
    │ POST /api/line/webhook  (signature verified)
    ▼
webhook-handler.ts
    │ profile + save user/message
    ├── LINE Messaging API (get profile)
    └── backend.ecobz.team/api/v1/line/* (storage)

Chat Center
    │ send → LINE push API + save outbound message
    └── poll backend for conversation list
```

## Setup

1. Copy `.env.example` → `.env.local`
2. Set `LINE_CHANNEL_ACCESS_TOKEN` (Messaging API)
3. Set `LINE_CHANNEL_SECRET` (Basic settings — **required** for webhook)
4. Set `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000` or production URL)
5. Open Chat Center → copy webhook URL → paste in LINE Developers Console
6. Enable **Use webhook** in LINE Console

### Production (e.g. https://crm.ecobz.team)

Set these in your host’s **Environment variables** (Vercel, Docker, PM2, etc.), then **redeploy**:

| Variable | Example |
|----------|---------|
| `LINE_CHANNEL_ACCESS_TOKEN` | from LINE Developers → Messaging API |
| `LINE_CHANNEL_SECRET` | from LINE Developers → Basic settings |
| `NEXT_PUBLIC_APP_URL` | `https://crm.ecobz.team` |
| `NEXT_PUBLIC_API_URL` | `https://backend.ecobz.team` |

`NEXT_PUBLIC_*` values are applied at **build time** — set them before deploy, or trigger a new build after changing them.

Check: open `https://crm.ecobz.team/api/line/webhook` — you want `"status":"ready"` and `webhook_url` ending with `/api/line/webhook` on your domain.

### PM2 (crm.ecobz.team)

PM2 does **not** read `.env.local` from your laptop. On the **server**, in the app folder:

```bash
cp .env.example .env.production
nano .env.production   # paste LINE_CHANNEL_ACCESS_TOKEN, LINE_CHANNEL_SECRET, NEXT_PUBLIC_APP_URL, etc.
npm run build
pm2 delete my-app-crm 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
```

Confirm env reached the process (no secrets printed, only true/false):

```bash
node --env-file=.env.production -e "console.log('token', !!process.env.LINE_CHANNEL_ACCESS_TOKEN, 'secret', !!process.env.LINE_CHANNEL_SECRET)"
```

If that prints `token true secret true` but the app still fails, you started PM2 with `npm start` instead of `ecosystem.config.cjs` — use the ecosystem file so `--env-file` is applied.

### Local dev with ngrok

```bash
ngrok http 3000
# Set NEXT_PUBLIC_APP_URL=https://xxxx.ngrok-free.app
# Restart npm run dev
```

## Files

| File | Role |
|------|------|
| `env.ts` | Credentials |
| `messaging-api.ts` | LINE push / profile |
| `webhook-handler.ts` | Process incoming events |
| `store.ts` | Backend persistence |
| `send.ts` | Outbound from Chat Center |
| `app/api/line/webhook/route.ts` | HTTP endpoint |

## Security

Never commit `LINE_CHANNEL_ACCESS_TOKEN` or `LINE_CHANNEL_SECRET`.  
If a token was shared in chat, rotate it in LINE Developers Console.
