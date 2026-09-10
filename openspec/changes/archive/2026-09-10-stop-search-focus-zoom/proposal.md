## Why

The public map's search field is styled `font-size: 0.95rem` — 15.2px. iOS Safari
automatically zooms the page whenever a form control smaller than 16px receives focus. The
field is 0.8px under that threshold, so every tap into search zooms the visitor in.

Getting back out is impossible. The site is a full-bleed MapLibre canvas inside a
`100dvh`, `overflow: hidden` shell, and MapLibre calls `preventDefault` on touch gestures
over the canvas — so a pinch zooms the *map*, not the page. Installed to the home screen
the app runs in `display: standalone`, so there is no address bar offering Safari's "reset
zoom" either. The visitor is trapped at the new scale until they force-quit the app.

Two faults compound: something zooms the page in, and nothing can zoom it back out. Only
the second is architectural. Removing the trigger is a one-line fix and resolves the
symptom completely.

## What Changes

- Raise the search field to `font-size: 1rem` (16px), at or above the threshold at which
  iOS Safari applies focus zoom. The rendered difference is 15.2px to 16px.
- Establish that no form control on the public site may be styled below 16px, so a future
  restyle cannot silently reintroduce the trap.

Deliberately **not** done: adding `maximum-scale=1` or `user-scalable=no` to the viewport
meta. That suppresses the symptom by disabling pinch zoom for everyone, including visitors
who rely on it to read the page. Safari has ignored `user-scalable=no` since iOS 10
regardless, so it would cost accessibility without even working.

Also not done: making the map surrender pinch gestures to the page. The map owning pinch
is correct — it is the primary interaction. It is only a trap in combination with an
unwanted zoom, and that combination disappears here.

Not breaking: no data, schema, build, or admin change.

## Capabilities

### New Capabilities

- `public-map-viewport`: the public map's viewport contract on a touch device — that the
  visitor is never left at a zoom level they have no way to leave.

This capability covers zoom escapability only. Following the precedent set when
`public-map` was opened, it does **not** retroactively document the search field's
filtering behaviour, the sidebar-on-focus interaction, the map's own zoom limits, or the
PWA manifest. Those stay unspecified until a change is actually about them.

### Modified Capabilities

None.

## Impact

- `src/routes/+page.svelte` — one declaration in the `.search-box input[type='search']`
  rule. The only file changed.
- The search field is the only form control on the public site, so no other element needs
  auditing. The admin app is already immune: it overrides no input font sizes and
  inherits Pico's 1rem default.
- No change to `src/app.html`, the viewport meta, or the map's gesture handlers.
