# TODO

Loose ends found while removing the public site's service worker (October 2026).
Most valuable first.

- [ ] **Split the large client bundle.**
      Vite warns that a client chunk exceeds 500 kB (likely MapLibre plus the bundled
      restaurant data). With no service worker cache, every visit pays for it.
      Consider lazy-loading the map component.

- [ ] **Make local development honour the Node 24 pin.**
      `.node-version` pins Node 24 for Pages, but local development has been running Node 26,
      since nothing locally reads that file. Use a version manager that does, or add
      `engines` (with `engine-strict`) to `package.json` so a mismatch fails loudly.
      Tried `engines` (24.x) in both package.json files, with the existing `engine-strict`:
      it fails `pnpm install` on a mismatch but not `dev` or `build`, and without a project
      `mise.toml` (declined) it only blocks installs, so it was reverted.
