## 1. Confirm the font stack

Blocks the label layer: a missing glyph stack fails as invisible text, not an error.

- [x] 1.1 Confirm `Noto Sans Regular` resolves from the configured `glyphs` endpoint (it already serves the `cluster-count` layer)
- [x] 1.2 If any weight other than Regular is wanted, fetch it from `demotiles.maplibre.org` and confirm it exists before using it; otherwise use Regular

## 2. Add the label layer

- [x] 2.1 Add a `restaurant-label` symbol layer over the `restaurants` source, filtered with `['!', ['has', 'point_count']]` to match `unclustered-point`
- [x] 2.2 Add it **after** `unclustered-point` so labels draw above the dots
- [x] 2.3 Set `text-field` to the name only — do not include `branch`
- [x] 2.4 Set `text-variable-anchor: ['top', 'bottom']` with `text-radial-offset` (not `text-offset`, which is ignored when variable anchor is set) and `text-justify: 'auto'`
- [x] 2.5 Set `text-halo-color` and `text-halo-width` so names stay legible over the raster basemap's baked-in labels
- [x] 2.6 Do **not** set `minzoom` on this layer — appearance is governed by clustering state and collision, per design Decision 1
- [x] 2.7 Leave `text-allow-overlap` at its default (false) so crowded labels thin themselves
- [x] 2.8 Do not modify `maxZoom` (`:109`, `:362`), `clusterMaxZoom` or `clusterRadius` (`:114`, `:115`), or the `flyTo` zoom in `navigateToRestaurant` (`:266`) — see design Decision 2

## 3. Make labels interactive

- [x] 3.1 Widen the `click` registration at `:199` from `'unclustered-point'` to `['unclustered-point', 'restaurant-label']`; the handler body needs no change
- [x] 3.2 Widen the `mouseenter` registration at `:216` to the same array
- [x] 3.3 Widen the `mouseleave` registration at `:219` to the same array
- [x] 3.4 Verify clicking a label opens the same popup as clicking its dot
- [x] 3.5 Verify the cursor becomes a pointer over a label on desktop

## 4. Verify against the spec

Each item maps to a scenario in `specs/public-map/spec.md`.

- [ ] 4.1 A restaurant with no close neighbours shows its name when drawn individually
- [ ] 4.2 A cluster shows its count and no restaurant name
- [ ] 4.3 At one zoom, a dense area shows fewer names than a sparse area — the zoom alone does not decide
- [ ] 4.4 Where two names would overlap, at most one draws and **both dots remain visible**
- [ ] 4.5 A name suppressed by crowding appears after zooming further in
- [ ] 4.6 At z16, confirm Xi'an Biang Biang / Yeye's Noodle & Dumpling and Little Green / Deun Deun Korean Restaurant each resolve to two placed labels via variable anchoring, or degrade to one label plus a bare dot
- [ ] 4.7 Confirm the five duplicate-name brands render two identical labels — expected, documented in the proposal, not a regression
- [ ] 4.8 Run `pnpm check` and confirm no new type errors
