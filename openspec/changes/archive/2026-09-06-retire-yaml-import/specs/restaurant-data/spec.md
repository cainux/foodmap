## REMOVED Requirements

### Requirement: One-time migration from yaml
**Reason**: The migration it describes was performed once and completed in `ca99408`, which
deleted `data/restaurants.yaml` — the requirement's only possible input. The tooling left
behind cannot run: `scripts/migrate-restaurants-to-d1.js` fails with `ENOENT` on the deleted
file, and `drizzle/seed-from-yaml.sql` is a frozen 57-row snapshot that the live 59-row table
has already diverged from. D1 has been the single source of truth since the cutover, so the
requirement describes a capability the system neither has nor needs.

**Migration**: None required. No caller, script, or build step depends on this requirement —
`scripts/build-restaurants-data.js` reads D1 directly and never touched the yaml pipeline.
The historical data remains recoverable from git for reference:
`git show ca99408^:data/restaurants.yaml` returns all 57 original entries in their authored
form. Anyone seeding a fresh local database should use the generated
`src/lib/restaurants.json`, as `AGENTS.md` already directs.
