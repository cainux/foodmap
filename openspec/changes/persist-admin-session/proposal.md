## Why

Signed-in admin sessions are held only in a Worker isolate's in-memory `Map` (`MemorySessionStore`), so any isolate recycle (idle eviction, redeploy, or routing to a different edge instance) silently drops the session even though the `foodmap_admin_session` cookie is still valid for 30 days. `hooks.server.ts` then treats the failed restore as "not signed in," deletes the cookie, and bounces to `/auth/login` — forcing the admin to redo the Bluesky OAuth flow far more often than the cookie's own lifetime implies.

## What Changes

- Replace `MemorySessionStore` with a durable, D1-backed session store (mirroring the existing `D1StateStore` pattern already used for OAuth callback state) so sessions survive isolate recycling.
- Persisted session/token material (the AT Protocol `Session`, which carries live OAuth tokens and a DPoP key) is encrypted at rest in D1, not stored as plaintext JSON.
- Sessions are pruned/expired server-side in step with (or ahead of) the existing 30-day cookie `maxAge`, so a dead cookie and a live D1 row don't drift apart.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `atproto-admin-auth`: sign-in sessions must persist across Worker isolate restarts, not just for the lifetime of one isolate.

## Impact

- `admin/src/lib/server/auth/atproto.ts` — replace `MemorySessionStore` with a D1-backed implementation; likely reuses `serialize`/`deserialize` helpers, plus new encryption.
- `admin/src/lib/server/auth/client.ts` — swap `sessionStore: new MemorySessionStore()` for the new store.
- `admin/src/lib/server/db/schema.ts` — new table (or reuse of `atprotoOauthState`-style table) for persisted sessions.
- Requires a secret/key for encrypting session data at rest (new Worker secret).
