# Map glyphs

PBF glyph ranges for `Noto Sans Regular`, the only fontstack the map's text layers
request (`cluster-count` and `restaurant-label` in `RestaurantMap.svelte`). Noto Sans is
SIL OFL 1.1 licensed.

Shipped ranges: `0-255` (Latin, digits, basic punctuation) and `8192-8447` (general
punctuation: curly quotes, dashes). A character outside these draws as a blank in its
label. Restaurant names were all ASCII when these were generated; if a future name needs
another range, regenerate with it added.

Regenerate from `NotoSans-Regular.ttf` with [`fontnik`](https://www.npmjs.com/package/fontnik)
(`fontnik.range({ font, start, end })` per range, written to `<start>-<end>.pbf`).
The directory name must match the fontstack name in the style.
