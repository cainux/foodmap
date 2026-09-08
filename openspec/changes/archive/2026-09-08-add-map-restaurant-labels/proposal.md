## Why

The public map renders every restaurant as an identical 8px dot. A dot carries no
identity, so the only way to learn what a place is called is to tap it and read the
popup — one at a time. The median restaurant is drawn as an individual point from about
z13.5, and the map's ceiling is z16, so across that whole band a visitor sees a field of
anonymous dots with room to spare around them. Answering "what is near here" costs one
tap per dot.

## What Changes

- Render the restaurant name next to its dot on the public map, as a new symbol layer
  filtered to unclustered points.
- Govern label appearance by **clustering state plus collision detection**, not a zoom
  threshold. A point that has escaped its cluster has, by definition, at least
  `clusterRadius` of screen clearance; MapLibre's default text collision then decides
  which of those names actually fit. Density varies wildly across the map at any given
  zoom, so a global zoom threshold is the wrong instrument.
- Make the label itself tappable, opening the same popup as its dot.
- Keep the dot on its own circle layer. When collision suppresses a name, the bare dot
  remains — a restaurant is never removed from the map by a typography decision.

The map's zoom and clustering settings (`maxZoom`, `clusterMaxZoom`, `clusterRadius`) are
deliberately left untouched. See `design.md` — Decision 2.

Not breaking: no data, schema, build, or admin change. The public site's generated
`restaurants.json` is untouched.

## Capabilities

### New Capabilities

- `public-map`: how the public map identifies restaurants in place — when a restaurant's
  name is shown beside it, how names behave when they compete for room, and how a name
  responds to being selected.

The `add-restaurant-branches` change deliberately declined to open this capability, on
the grounds that adding one field should not drag a large body of unspecified rendering
behaviour into a spec. That reasoning still holds and is respected here: this spec covers
restaurant identification only. It does **not** retroactively document the map's existing
marker styling, clustering, zoom limits, geolocation, bounds-fitting, or popup
composition. Those remain unspecified until a change is actually about them.

### Modified Capabilities

None. `restaurant-data` already exposes everything this change consumes.

## Impact

- `src/lib/components/RestaurantMap.svelte` — the only file changed. One new symbol layer
  and three event registrations widened to include it. No existing layer, source option,
  or zoom constant is modified.
- No changes to `scripts/build-restaurants-data.js`, the D1 schema, or the admin app.
- Depends on the existing `glyphs` endpoint (`demotiles.maplibre.org`), which already
  serves `Noto Sans Regular` for the cluster-count layer. Any other font stack must be
  verified against that host before use; a missing stack fails as invisible text.

### Known limitation

Five restaurant brands have two locations each — 10 of 59 records — and the `branch`
field is empty on all of them. Those pairs will render two identical labels. The label
deliberately shows the name only; the popup already distinguishes branches, so the
ambiguity costs a tap rather than the information. Populating those records is a data
task outside this change.
