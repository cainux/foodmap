## Why

The `restaurants` table's schema lives in the root project, which has no runtime D1
access, no wrangler config, and no tracked migration path. Its one migration
(`drizzle/migrations/0000_yummy_stardust.sql`) was applied to remote by hand and is absent
from the `d1_migrations` table, so nothing records that it ran or would stop it being
missed on a fresh database.

Meanwhile the admin — the only app that reads or writes D1 at runtime — has a working,
tracked migration runner. The result is that `restaurants` DDL is duplicated across two
projects (two byte-identical `drizzle.config.ts` files, two copies of the same table
definition) while the copy that actually matters is the one with no tooling behind it. Any
future schema change has to be written twice and applied by an undocumented manual step.

This blocks `add-restaurant-branches`, which needs to add a column to `restaurants` and has
nowhere safe to put the migration.

## What Changes

- Adopt `drizzle/migrations/0000_yummy_stardust.sql` into the admin's tracked migration
  chain as `admin/drizzle/migrations/0003_adopt_restaurants.sql`, rewritten to use
  `CREATE TABLE IF NOT EXISTS` so it is a no-op against the live database and a real create
  against a fresh one. This avoids editing the `d1_migrations` table on production by hand.
- Delete the root project's vestigial D1 tooling: `drizzle.config.ts`,
  `src/lib/server/db/schema.ts` (zero importers), and `drizzle/migrations/` including its
  `meta/` journal, which wrangler does not read.
- Remove `drizzle-orm` and `drizzle-kit` from the root project's `devDependencies`. The
  root project has an empty `dependencies` block and touches D1 only through a single
  `wrangler d1 execute --command` call in `scripts/build-restaurants-data.js`, which needs
  neither package.
- Update `AGENTS.md` (and therefore `CLAUDE.md`, its symlink): `admin/drizzle/migrations`
  becomes the single owner of all D1 schema, and the two-step fresh-local-database setup
  collapses to one `wrangler d1 migrations apply` call.

No runtime behaviour changes. The public site, the admin, and the database contents are
identical before and after.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a pure tooling and documentation refactor: it relocates where schema is
defined and how migrations are applied, without altering any requirement about what the
system does. `skip_specs: true` is set in `.openspec.yaml` accordingly.

## Impact

**Deleted**
- `drizzle.config.ts`
- `src/lib/server/db/schema.ts`
- `drizzle/migrations/0000_yummy_stardust.sql` (content moves to the admin)
- `drizzle/migrations/meta/_journal.json`, `drizzle/migrations/meta/0000_snapshot.json`

**Added**
- `admin/drizzle/migrations/0003_adopt_restaurants.sql`

**Modified**
- `package.json` — drops two `devDependencies`
- `AGENTS.md` — migration ownership rule and local setup steps

**Production**
- Requires `npx wrangler d1 migrations apply foodmap --remote` from `admin/`, which will
  record `0003_adopt_restaurants.sql` as applied without altering the existing table.

**Left alone deliberately**
- `scripts/migrate-restaurants-to-d1.js` and `drizzle/seed-from-yaml.sql`, the one-off
  yaml-to-D1 import. Both appear dead — nothing references them and no yaml source remains
  in the repo — but removing them touches the "One-time migration from yaml" requirement in
  the `restaurant-data` spec, so it is a separate decision rather than a silent deletion
  here. Note that this leaves `drizzle/seed-from-yaml.sql` as the only remaining file in
  `drizzle/`.
