## 1. Confirm the files are dead before deleting them

- [x] 1.1 Confirm `node scripts/migrate-restaurants-to-d1.js` still fails with
      `ENOENT ... data/restaurants.yaml`, and that `data/` does not exist.
- [x] 1.2 Confirm `grep -rn "yaml" src/ scripts/ admin/src/` shows
      `scripts/migrate-restaurants-to-d1.js` as the only importer of the `yaml` package.
- [x] 1.3 Confirm nothing references the seed file:
      `grep -rn "seed-from-yaml" . --exclude-dir=node_modules --exclude-dir=.git`
      should match only the script that generates it and this change's own artifacts.
- [x] 1.4 Confirm the history is recoverable before removing its generated form:
      `git show ca99408^:data/restaurants.yaml` must return 57 entries.

## 2. Delete

- [x] 2.1 Delete `scripts/migrate-restaurants-to-d1.js`.
- [x] 2.2 Delete `drizzle/seed-from-yaml.sql`. Confirm `drizzle/` is then empty and remove
      the directory — `consolidate-d1-schema` removed everything else in it.
- [x] 2.3 Remove `yaml` from the root `package.json` `devDependencies` and run
      `pnpm install` to update the lockfile.

## 3. Verify

- [x] 3.1 Run `pnpm check` at the root.
- [x] 3.2 Run `pnpm build` at the root and confirm it still fetches from D1 and writes
      `src/lib/restaurants.json` — `scripts/build-restaurants-data.js` is unrelated to the
      deleted pipeline, and this proves it.
- [x] 3.3 Confirm no deploy, migration, or publish is needed: this change touches no
      database, no worker, and no public-site content.
