## Why

Installed to the home screen, the public map runs in `display: standalone`, which puts the
page against the bottom of the phone screen — the same strip the OS reserves for its
swipe-up home gesture. The restaurant list's collapsed bottom sheet peeks exactly 28px
above that edge (`translateY(calc(100% - 28px))`), and all 28px of it is the grab handle:
a pointer-driven target with `touch-action: none`. The OS gesture strip is 20–34px tall,
so it covers the entire peek. There is no part of the handle that is not also the home
gesture.

Two independent faults produce the symptom:

**Spatial.** The only interactive target of the collapsed sheet sits wholly inside the
strip the OS claims. Every home swipe starts on the handle.

**Behavioural.** `onpointercancel` is wired to the same handler as `onpointerup`. When the
OS claims a gesture the browser fires `pointercancel` — meaning *the gesture was taken away
from you* — but the handler treats it identically to a completed drag and commits the
toggle. A swipe cancelled at `deltaY = -40` satisfies `!open && deltaY < -10` and opens the
list. So the list opens as the visitor leaves the app, and is open when they return.

Fixing only the geometry would leave a stolen gesture still committing whenever the two
overlap by any margin at all. Both are fixed here.

## What Changes

- Extend the collapsed peek so that an inert strip sits below the grab handle, between it
  and the bottom of the screen. The sheet's background still runs to the screen edge, so
  nothing changes visually except the handle sitting slightly higher; the revealed strip
  carries no pointer handlers and does not toggle the sheet.
- Size that strip `max(env(safe-area-inset-bottom), 28px)`. See `design.md` — Decision 1.
- Treat `pointercancel` as an abandoned drag: reset the drag state and let the sheet
  return to whichever position it was in, without toggling.
- Pad the bottom of the sheet's scrolling list by the same inset, so that when the sheet
  is open the last restaurant card — itself a tap target — is not in the gesture strip
  either.

The collapsed peek is kept. A floating "N places" pill above the strip would sidestep the
conflict entirely but would cost the drag-up affordance, which is wanted.

Not breaking: no data, schema, build, or admin change.

## Capabilities

### New Capabilities

- `restaurant-list-sheet`: how the restaurant list is revealed and dismissed on a phone —
  what the collapsed sheet offers as a target, and how that target coexists with the
  operating system's own edge gestures.

This capability covers the sheet's reveal and dismissal only. Following the precedent set
when `public-map` was opened, it does **not** retroactively document the sheet's height,
its desktop slide-in form, the card contents, distance sorting, or the search filtering
that feeds it. Those stay unspecified until a change is actually about them.

### Modified Capabilities

None.

## Impact

- `src/lib/components/Sidebar.svelte` — the collapsed transform, the pointer event
  wiring, and the scroll container's bottom padding. The only file changed.
- `src/app.html` is deliberately untouched: `viewport-fit=cover` is **not** adopted. See
  `design.md` — Decision 1.
- `.location-button` in `RestaurantMap.svelte` sits at `bottom: 2.5rem`, apparently
  hand-tuned to clear the same strip. It is left alone here; making that clearance
  explicit belongs to a change about the map's own controls.
