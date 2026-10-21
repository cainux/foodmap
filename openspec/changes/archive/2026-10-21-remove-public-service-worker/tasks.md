## 1. Hand-authored manifest

- [x] 1.1 Create `static/manifest.webmanifest` with the plugin's current manifest content verbatim (name, short_name, description, start_url, scope, display, background_color, theme_color, orientation, icons)
- [x] 1.2 Add `<link rel="manifest" href="/manifest.webmanifest" />` to `src/app.html` alongside the existing PWA meta tags

## 2. Remove the PWA plugin

- [x] 2.1 Remove `SvelteKitPWA(...)`, the `pwaServiceWorker()` plugin and its doc comment, and the `vite-plugin-pwa` imports from `vite.config.ts`
- [x] 2.2 Remove the `virtual:pwa-info` import, `webManifestLink` and the `{@html webManifestLink}` head entry from `src/routes/+layout.svelte`
- [x] 2.3 Remove the two `vite-plugin-pwa` type references from `src/app.d.ts`
- [x] 2.4 `pnpm remove @vite-pwa/sveltekit vite-plugin-pwa` in the repo root
- [x] 2.5 Grep `src/`, `vite.config.ts` and `package.json` for `pwa`, `workbox`, `registerSW` and `sw.js` and confirm nothing remains

## 3. Docs

- [x] 3.1 Delete the `@vite-pwa/sveltekit` / `buildApp` / `build/sw.js` bullet from the SvelteKit 3 section of `CLAUDE.md`
- [x] 3.2 Reword the admin PWA bullets in `CLAUDE.md` so they no longer contrast with a public-site service worker, and state that neither app ships a service worker and both hand-author their manifest in `static/`
- [x] 3.3 Replace the `offline-caching-deferred` memory with a note that the public service worker was removed deliberately (staleness of bundled data), and update `MEMORY.md`

## 4. Verify

- [x] 4.1 `pnpm check` passes
- [x] 4.2 `pnpm build` succeeds, and `build/` contains `manifest.webmanifest` but no `sw.js`, `registerSW.js` or `workbox-*.js`
- [x] 4.3 `pnpm preview`: the page head links `/manifest.webmanifest`, DevTools → Application → Manifest shows it as installable with no errors, and no service worker is registered
- [x] 4.4 After merging, publish from the admin and confirm the live site serves `/manifest.webmanifest`, serves no service worker script at `/sw.js` (Pages answers unknown paths with `index.html`, not a 404), registers no service worker, and still offers to install
