## Why

The yaml-to-D1 cutover finished in `ca99408` ("Remove yaml restaurant pipeline, finish D1
cutover"), which deleted `data/restaurants.yaml`. Two artefacts of that migration were left
behind and are now dead rather than merely unused:

- `scripts/migrate-restaurants-to-d1.js` reads the deleted yaml file. Running it today fails
  immediately with `ENOENT: no such file or directory, open '.../data/restaurants.yaml'`. It
  cannot be run, and there is no input that would make it runnable.
- `drizzle/seed-from-yaml.sql` is that script's output: 57 `INSERT` statements, applied once
  to populate D1. It is a frozen snapshot from cutover, not a backup — the live table holds
  59 rows and every admin edit since has diverged from it further.

Three things make these worth removing rather than ignoring:

- **The script pins a dependency.** `yaml: ^2.8.2` sits in the root `devDependencies` solely
  for this script; nothing in `src/`, `scripts/`, or `admin/src/` else imports it.
- **Its purpose is already served better.** `AGENTS.md` directs anyone seeding a fresh local
  database to the generated `src/lib/restaurants.json`, which is current. The seed file is a
  staler answer to a question already answered.
- **`seed-from-yaml.sql` is the last file in `drizzle/`.** `consolidate-d1-schema` emptied
  that directory of everything else; removing this removes the directory.

## What Changes

- Delete `scripts/migrate-restaurants-to-d1.js`.
- Delete `drizzle/seed-from-yaml.sql`, and with it the now-empty `drizzle/` directory.
- Remove `yaml` from the root `devDependencies`.
- Retire the `restaurant-data` capability's "One-time migration from yaml" requirement. The
  system will no longer be able to migrate from yaml, and the spec should stop claiming it
  can.

Provenance is not lost. `data/restaurants.yaml` remains recoverable from
`git show ca99408^:data/restaurants.yaml` — 57 entries, matching the 57 `INSERT` statements —
in its original authored form rather than as generated SQL.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `restaurant-data`: the "One-time migration from yaml" requirement is removed. The
  capability's remaining requirements — the record schema, and readability by the public
  build — are unaffected.

## Impact

**Deleted**
- `scripts/migrate-restaurants-to-d1.js`
- `drizzle/seed-from-yaml.sql`, leaving `drizzle/` empty and therefore gone

**Modified**
- `package.json` — drops the `yaml` devDependency

**Not affected**
- The database. This change removes a tool that could populate `restaurants`; it does not
  touch the table or its 59 rows. No migration, no deploy, no publish.
- `add-restaurant-branches`. The two changes are independent and can land in either order.

**Note**
- `AGENTS.md` needs no edit. It already points at `src/lib/restaurants.json` for seeding a
  fresh local database and never mentions either deleted file.
