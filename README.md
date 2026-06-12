# FXNod Frontend

Next.js 14 web application for FXNod trading platform.

## Tech Stack
- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui**
- **Zustand** - State management
- **TanStack Query** - API data fetching
- **Axios** - HTTP client
- **TradingView Charting Library** - For trading charts

## Folder Structure
```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── trade/page.tsx
│   │   │   ├── referrals/page.tsx
│   │   │   └── wallet/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── trading/
│   │   ├── referral/
│   │   └── shared/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDerivWebSocket.ts
│   │   └── useReferralData.ts
│   ├── services/            # API clients
│   │   ├── api.ts
│   │   ├── authApi.ts
│   │   ├── referralApi.ts
│   │   └── tradingApi.ts
│   ├── stores/
│   ├── types/
│   └── utils/
├── public/
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Deployment (Vercel)

The frontend deploys to **Vercel**; the backend runs on the **VPS** behind
Caddy. They are different origins, so the setup is cross-origin with
credentialed requests (the refresh cookie).

### Environment variables (Vercel dashboard)

Add these under **Project → Settings → Environment Variables** for the
`Production` (and `Preview`) environments. They're also in
[`.env.example`](./.env.example):

| Key | Production value | Notes |
|-----|------------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.fxnod.com` | VPS API domain (Caddy → NGINX gateway). No trailing slash. |
| `NEXT_PUBLIC_WS_URL`  | `wss://api.fxnod.com`  | Same host, `wss` scheme. |

For local dev, copy [`.env.local.example`](./.env.local.example) → `.env.local`
(points at `http://localhost`).

> There are **no secrets** in the frontend. The access token is issued at
> runtime and held in memory; the refresh token is an httpOnly cookie the JS
> never reads. Never add backend secrets as `NEXT_PUBLIC_*` — they'd ship to
> the browser.

### How auth works cross-origin

1. `POST /api/v1/auth/login` → backend returns the **access token** in the body
   (kept in memory via the Zustand store) **and** sets the **refresh token** as
   an `httpOnly; Secure; SameSite=None` cookie.
2. Every API call uses `withCredentials: true` so that cookie rides along.
3. On a `401`, the axios interceptor silently calls `POST /api/v1/auth/refresh`
   (cookie only, no body), gets a fresh access token, and retries — single-
   flight, so a burst of 401s triggers exactly one refresh.
4. A hard reload loses the in-memory token; `authStore.bootstrap()` calls
   `/users/me`, which 401s, refreshes via the cookie, and restores the session.

The NGINX `auth_request` pattern is **unchanged** — it still verifies the
`Authorization: Bearer` access token via the Auth service `/verify` endpoint.
The cookie is only used at `/api/v1/auth/refresh|logout`.

### ⚠️ CORS — backend must allow the Vercel origin

Because the cookie is credentialed, the backend **cannot** use
`Access-Control-Allow-Origin: *`. Caddy reflects a specific allowlist (the
Vercel production domain + `*.vercel.app` preview deploys) and sends
`Access-Control-Allow-Credentials: true`. Set `FRONTEND_ORIGIN` on the VPS
(see `infrastructure/caddy/Caddyfile` + `.env.prod`). Add your real Vercel
domain there before going live.

### Build settings

`vercel.json` pins the framework (`nextjs`), the `--legacy-peer-deps` install
(eslint version conflict), the `fra1` region, and long-cache headers for
`/_next/static`. Production build optimizations live in `next.config.mjs`
(`poweredByHeader: false`, no browser source maps, package-import trimming).

## Pages

### Public
- `/login` - User login
- `/register` - User registration (with optional referral code)

### Protected (Dashboard)
- `/trade` - Trading interface
- `/referrals` - Referral tree, stats, code sharing
- `/wallet` - Balance, transaction history, withdrawals

## API Integration

All API calls go through NGINX gateway:
- `GET/POST /api/v1/auth/*` → Auth Service
- `GET/POST /api/v1/referrals/*` → Referral Service
- `GET/POST /api/v1/markets/*`, `/api/v1/orders/*` → Trading Service
- `WS /ws/*` → Trading Service (live prices)

## Notes for Implementation
- Use Zustand for auth state (JWT tokens)
- Use TanStack Query for API caching
- Store refresh token in **httpOnly cookie**, access token in memory
- Implement automatic token refresh on 401 responses
- WebSocket reconnection logic with exponential backoff
