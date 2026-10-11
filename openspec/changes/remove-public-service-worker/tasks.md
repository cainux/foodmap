## 1. Hand-authored manifest

- [ ] 1.1 Create `static/manifest.webmanifest` with the plugin's current manifest content verbatim (name, short_name, description, start_url, scope, display, background_color, theme_color, orientation, icons)
- [ ] 1.2 Add `<link rel="manifest" href="/manifest.webmanifest" />` to `src/app.html` alongside the existing PWA meta tags

## 2. Remove the PWA plugin

- [ ] 2.1 Remove `SvelteKitPWA(...)`, the `pwaServiceWorker()` plugin and its doc comment, and the `vite-plugin-pwa` imports from `vite.config.ts`
- [ ] 2.2 Remove the `virtual:pwa-info` import, `webManifestLink` and the `{@html webManifestLink}` head entry from `src/routes/+layout.svelte`
- [ ] 2.3 Remove the two `vite-plugin-pwa` type references from `src/app.d.ts`
- [ ] 2.4 `pnpm remove @vite-pwa/sveltekit vite-plugin-pwa` in the repo root
- [ ] 2.5 Grep `src/`, `vite.config.ts` and `package.json` for `pwa`, `workbox`, `registerSW` and `sw.js` and confirm nothing remains

## 3. Docs

- [ ] 3.1 Delete the `@vite-pwa/sveltekit` / `buildApp` / `build/sw.js` bullet from the SvelteKit 3 section of `CLAUDE.md`
- [ ] 3.2 Reword the admin PWA bullets in `CLAUDE.md` so they no longer contrast with a public-site service worker, and state that neither app ships a service worker and both hand-author their manifest in `static/`
- [ ] 3.3 Replace the `offline-caching-deferred` memory with a note that the public service worker was removed deliberately (staleness of bundled data), and update `MEMORY.md`

## 4. Verify

- [ ] 4.1 `pnpm check` passes
- [ ] 4.2 `pnpm build` succeeds, and `build/` contains `manifest.webmanifest` but no `sw.js`, `registerSW.js` or `workbox-*.js`
- [ ] 4.3 `pnpm preview`: the page head links `/manifest.webmanifest`, DevTools → Application → Manifest shows it as installable with no errors, and no service worker is registered
- [ ] 4.4 After merging, publish from the admin and confirm the live site serves `/manifest.webmanifest`, returns 404 for `/sw.js`, and still offers to install
