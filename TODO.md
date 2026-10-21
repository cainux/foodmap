# TODO

Loose ends found while removing the public site's service worker (October 2026).
Most valuable first.

- [ ] **Split the large client bundle.**
      Vite warns that a client chunk exceeds 500 kB (likely MapLibre plus the bundled
      restaurant data). With no service worker cache, every visit pays for it.
      Consider lazy-loading the map component.
