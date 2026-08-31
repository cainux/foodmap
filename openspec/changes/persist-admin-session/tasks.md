## 1. Schema & secrets

- [x] 1.1 Add `atprotoOauthSession` table to `admin/src/lib/server/db/schema.ts` (key, encrypted value, createdAt) and generate the Drizzle migration
- [x] 1.2 Generate and add `SESSION_ENCRYPTION_KEY` as a Cloudflare Pages/Worker secret for the admin project

## 2. D1-backed session store

- [x] 2.1 Implement AES-GCM encrypt/decrypt helpers keyed by `SESSION_ENCRYPTION_KEY`
- [x] 2.2 Implement `D1SessionStore` in `admin/src/lib/server/auth/atproto.ts` (reusing `serialize`/`deserialize` for the `dpopKey` round-trip), storing encrypted payloads and `createdAt`
- [x] 2.3 On `get`, treat rows past 30-day expiry (or failed decrypt) as absent and delete them
- [x] 2.4 Swap `sessionStore: new MemorySessionStore()` for `new D1SessionStore(d1)` in `admin/src/lib/server/auth/client.ts`
- [x] 2.5 Remove `MemorySessionStore`

## 3. Verification

- [x] 3.1 Sign in locally, confirm session row is written to D1 (verified against deployed preview instead of local dev, per local-dev crypto blocker)
- [x] 3.2 Restart the dev server (simulating isolate recycle) and confirm the existing session is still recognized without re-login (verified via deployed preview: reload of same origin after natural isolate recycle stayed signed in)
- [x] 3.3 Manually expire/delete a session row and confirm the admin is redirected to sign-in (verified: deleting the D1 row bounced to /auth/login on next request)
