## Why

The public site's build emits a workbox service worker, but nothing registers it, so no
visitor has ever had offline caching. Registering it would introduce a real staleness
risk: restaurant data is bundled into a precached JS chunk, and with `registerType:
'prompt'` and no prompt UI, a newly published build would sit waiting indefinitely, with
an installed PWA showing the old list for days. Rather than build update UX for a cache
nobody has missed, we are removing the service worker machinery and keeping the site
installable through a hand-authored manifest, as the admin already does.

## What Changes

- Remove `@vite-pwa/sveltekit` and `vite-plugin-pwa` from the public site, along with
  the custom `buildApp` hook that generated `sw.js` under SvelteKit 3 and the unused
  workbox runtime-caching rules.
- Replace the plugin-generated web app manifest with a hand-authored
  `static/manifest.webmanifest` carrying the same name, short name, colours, display
  mode and icon, linked statically from `src/app.html`.
- Remove the `virtual:pwa-info` manifest injection from `src/routes/+layout.svelte` and
  the `vite-plugin-pwa` type references from `src/app.d.ts`.
- Update `CLAUDE.md`: drop the SvelteKit 3 PWA workaround guidance and reword the admin
  PWA notes that contrast the admin with the public site's service worker.
- No visitor-facing behaviour is lost. Production never registered the service worker,
  so there is nothing to unregister.

## Capabilities

### New Capabilities
- `public-app-shell`: The public site is installable as a standalone app and serves no
  content from an offline cache, so visitors always see the most recently published
  restaurants.

### Modified Capabilities
<!-- None. No existing spec covers the public site's PWA behaviour. -->

## Impact

- **Code:** `vite.config.ts`, `src/app.html`, `src/routes/+layout.svelte`,
  `src/app.d.ts`, new `static/manifest.webmanifest`.
- **Dependencies:** removes `@vite-pwa/sveltekit` and `vite-plugin-pwa` (and their
  transitive workbox packages) from the root `package.json`.
- **Build output:** `build/` no longer contains `sw.js`, `registerSW.js` or
  `workbox-*.js`.
- **Docs:** `CLAUDE.md` (SvelteKit 3 section and the admin PWA section).
- **Admin:** unaffected. It already ships a hand-authored manifest and no service worker.
