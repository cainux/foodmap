# TODO

Loose ends found while removing the public site's service worker (October 2026).
Most valuable first.

- [ ] **Stop depending on the MapLibre demo glyph server.**
      `RestaurantMap.svelte` loads glyphs from `demotiles.maplibre.org`, a demo host with no
      uptime promise. If it goes down, restaurant name labels disappear from the map.
      Self-host the glyph PBFs under `static/` or move to a production glyph provider.

- [ ] **Find out why a build once crashed in the D1 fetch step.**
      One `pnpm build` died in `scripts/build-restaurants-data.js` (the `wrangler d1 execute`
      step) with no clear error, then three identical runs passed. A repeat on Pages would
      fail a publish. Check how the script surfaces wrangler errors and consider a retry.

- [ ] **Split the large client bundle.**
      Vite warns that a client chunk exceeds 500 kB (likely MapLibre plus the bundled
      restaurant data). With no service worker cache, every visit pays for it.
      Consider lazy-loading the map component.

- [ ] **Make local development honour the Node 24 pin.**
      `.node-version` pins Node 24 for Pages, but local development has been running Node 26,
      since nothing locally reads that file. Use a version manager that does, or add
      `engines` (with `engine-strict`) to `package.json` so a mismatch fails loudly.
