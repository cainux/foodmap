## 1. Adopt the restaurants migration into the admin's chain

- [x] 1.1 Create `admin/drizzle/migrations/0003_adopt_restaurants.sql` with the table
      definition from `drizzle/migrations/0000_yummy_stardust.sql`, changed to
      `CREATE TABLE IF NOT EXISTS`. Columns must match the existing file exactly: `id`
      (integer PK autoincrement, not null), `name` (text not null), `url` (text not null),
      `lat` (real), `lng` (real), `tags` (text not null default `''`), `comment` (text).
- [x] 1.2 Delete `drizzle/migrations/0000_yummy_stardust.sql`,
      `drizzle/migrations/meta/_journal.json` and `drizzle/migrations/meta/0000_snapshot.json`.
      Leave `drizzle/seed-from-yaml.sql` in place.

## 2. Remove the root project's vestigial D1 tooling

- [x] 2.1 Delete `drizzle.config.ts` from the root project. Confirm first that it is still
      byte-identical to `admin/drizzle.config.ts`.
- [x] 2.2 Delete `src/lib/server/db/schema.ts`. Confirm first that
      `grep -rn "server/db" src/ scripts/` returns no importers, and that its `restaurants`
      block still matches the one in `admin/src/lib/server/db/schema.ts`.
- [x] 2.3 Remove `drizzle-orm` and `drizzle-kit` from the root `package.json`
      `devDependencies` and run `pnpm install` to update the lockfile.
- [x] 2.4 Run `pnpm check` and `pnpm build` at the root to confirm nothing depended on the
      removed files or packages.

## 3. Verify against a fresh local database

- [x] 3.1 Create a fresh local D1 and run `npx wrangler d1 migrations apply foodmap --local`
      from `admin/` as the only setup command. Confirm all four tables — `restaurants`,
      `atproto_oauth_state`, `atproto_oauth_session`, `publish_state` — are created.
- [x] 3.2 Confirm the admin runs against that fresh local database: `pnpm dev` in `admin/`,
      sign in at `127.0.0.1`, and load the restaurant list.

## 4. Apply to remote

- [x] 4.1 Record the current remote row count:
      `npx wrangler d1 execute foodmap --remote --command "SELECT COUNT(*) FROM restaurants"`.
      Expected: 59.
- [x] 4.2 From `admin/`, run `npx wrangler d1 migrations apply foodmap --remote`. Confirm
      `0003_adopt_restaurants.sql` is reported applied.
- [x] 4.3 Confirm `SELECT id, name FROM d1_migrations ORDER BY id` now lists four rows, and
      that the `restaurants` row count is unchanged from 4.1.
- [x] 4.4 Load the deployed admin and confirm the restaurant list still renders. No admin
      deploy is needed — this change alters no column and no query.

## 5. Update the documentation

- [x] 5.1 In `AGENTS.md`, replace the rule that `admin/drizzle/migrations` owns only "the
      tables the admin alone reads and writes ... The `restaurants` table is not among
      them" with a statement that it owns all D1 schema, including `restaurants`. Record
      why: the admin holds the only runtime D1 binding and the only drizzle usage, while
      the public build reaches D1 through one raw `wrangler d1 execute --command` call.
- [x] 5.2 In `AGENTS.md`, collapse the two-step fresh-local-database setup to the single
      `npx wrangler d1 migrations apply foodmap --local` command, removing the
      `--file=../drizzle/migrations/0000_yummy_stardust.sql` step.
- [x] 5.3 Add a note to `AGENTS.md` that migration filenames in
      `admin/drizzle/migrations` are tracked by name in `d1_migrations` and must never be
      renamed or renumbered once applied.
- [x] 5.4 Edit `AGENTS.md` directly, never `CLAUDE.md` — it is a symlink to the same file.
