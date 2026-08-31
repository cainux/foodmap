## Context

See proposal.md - Why. The existing `D1StateStore` (`admin/src/lib/server/auth/atproto.ts`) already persists short-lived OAuth *authorize→callback* state in D1 via Drizzle, using a `serialize`/`deserialize` pair that special-cases the `dpopKey`'s `JoseKey` class instance (round-tripped through its JWK). `MemorySessionStore` needs the same treatment, but for longer-lived, more sensitive data: the AT Protocol `Session`, which carries live OAuth access/refresh tokens.

## Goals / Non-Goals

**Goals:**
- Sessions survive Worker isolate recycling, matching the cookie's 30-day lifetime.
- Session token material is encrypted at rest in D1.
- Reuse the existing `atprotoOauthState`-style schema/serialization approach rather than inventing a new pattern.

**Non-Goals:**
- Multi-device / multi-session-per-user management (single-owner admin area, one session at a time is fine).
- Session revocation UI — `client.revoke()` is already called on the deny-listed-handle path and continues to work unchanged.
- Changing the cookie mechanism, `maxAge`, or the allow-list check.

## Decisions

**D1-backed `SessionStore`, new table.** Add a `atprotoOauthSession` table (parallel to `atprotoOauthState`) keyed by the session key (the DID), storing the encrypted, serialized `Session`. Mirrors the existing state-store pattern the codebase already trusts, rather than reaching for KV, Durable Objects, or an external store — no new infra dependency.

**Encrypt session payloads before storing.** Unlike OAuth state (short-lived, single-use, not itself a bearer credential), a `Session` contains live access/refresh tokens — D1 is not a secrets store, so encrypt the serialized JSON with AES-GCM using a new Worker secret (e.g. `SESSION_ENCRYPTION_KEY`) before insert, and decrypt on read. Alternative considered: leave it as plaintext like `D1StateStore` — rejected because state entries are single-use and expire in seconds/minutes, whereas sessions are long-lived bearer credentials.

**Reuse `serialize`/`deserialize` for the `dpopKey` round-trip.** Same JWK-revival logic already written for `InternalStateData`; apply it to `Session` before encrypting, since `Session` carries the same `Key` class instance problem.

**Expire rows alongside the cookie.** On `set`, store `createdAt` and derive expiry as `createdAt + 30 days` (matching the cookie's `maxAge`). On `get`, treat an expired row as absent (return `undefined`) and delete it. This keeps a dead cookie and a live D1 row from drifting: if the row's TTL is reached, `client.restore()` fails the same way it does today when the cookie's own `maxAge` lapses, and `hooks.server.ts`'s existing catch/redirect handles it without changes there.

## Risks / Trade-offs

- **[Risk]** Encryption key rotation is unhandled — rotating `SESSION_ENCRYPTION_KEY` invalidates all existing sessions at once. → **Mitigation**: acceptable for a single-owner admin area; a rotation just forces one re-login, same as today's steady-state behavior.
- **[Risk]** D1 write on every OAuth token refresh (the AT Protocol client refreshes access tokens periodically, calling `sessionStore.set` again). → **Mitigation**: D1 write volume here is bounded by one admin's usage; not a scaling concern.
- **[Risk]** Storing encrypted blobs in D1 means a bug in the encrypt/decrypt path could brick sign-in entirely (decrypt failure). → **Mitigation**: treat decrypt failure as "session not found" (same as today's `deserialize` failure path) rather than throwing uncaught, so it degrades to a re-login instead of a hard error.

## Migration Plan

1. Add the new D1 table via a Drizzle migration.
2. Add `SESSION_ENCRYPTION_KEY` as a Worker secret (generated once, stored in Cloudflare Pages project secrets alongside `CLOUDFLARE_API_TOKEN`).
3. Implement `D1SessionStore` and swap it into `createOAuthClient` in place of `MemorySessionStore`.
4. Deploy. No backward-compat shim needed — any in-flight in-memory sessions at deploy time are lost (a one-time forced re-login), same as any isolate recycle today.
