## Why

`keep-sheet-clear-of-home-gesture` grew the collapsed sheet's peek from 28px to
`28px + max(env(safe-area-inset-bottom), 28px)` so the grab handle would sit above the
operating system's home-gesture strip. That worked — the reported bug is fixed and
verified on device — but it moved a boundary that two other pieces of the interface were
quietly measured against, and left a third looseness visible.

**The location button now overlaps the sheet.** It sits at `bottom: 2.5rem` (40px) and is
44px tall, occupying 40–84px up from the screen edge. Against the old 28px peek that
cleared by 12px. Against the new 56px peek, its lower 16px sits over the sheet. That
`2.5rem` was hand-tuned against a number in another component, so growing the peek broke
it silently — the same class of coupling this change exists to remove.

**The open sheet has a dead gap.** `.gesture-strip` occupies the sheet's flex column in
both states. Collapsed it is the inert clearance doing its job; open it is roughly 28px of
nothing between the handle and the first card, and the handle reads as detached from the
list.

**The handle takes a text selection.** It is a `role="button"` div carrying no text, and
nothing suppresses selection or the tap highlight, so pressing it can paint a selection
band — apparently extending into the empty `.gesture-strip` beneath it. The looseness
predates the gesture work; the new sibling element made it visible.

The first two are regressions introduced by the previous change. The third is adjacent
polish in the same few pixels of screen, fixed here because it is the same element and the
same device test.

## What Changes

- Lift the bottom-clearance inset out of `Sidebar.svelte` into a scope both the sheet and
  the map can read, so every piece of bottom-edge furniture clears the same measured strip
  instead of carrying its own hand-tuned number. This is the actual fix; the two position
  corrections fall out of it.
- Move the location button clear of the collapsed sheet, expressed against that shared
  inset rather than as a literal. The button sits **above the collapsed sheet and stays
  there** when the list opens — it does not track the sheet's position.
- Drop the inert strip out of the sheet's layout when the sheet is open, so the gap under
  the handle returns to what it was. The strip still does its work collapsed, which is the
  only state in which the handle is near the screen edge.
- Suppress text selection and the tap highlight on the grab handle and the inert strip,
  while keeping a visible focus indicator for keyboard users.

Not breaking: no data, schema, build, or admin change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `restaurant-list-sheet`: the requirement *The sheet's targets stay clear of the system
  gesture area* is satisfied today by an element that occupies the layout in both states.
  It is sharpened to require the clearance only where it is needed — the collapsed state —
  so that satisfying it does not disturb the open sheet. A requirement is added covering
  the handle's appearance under touch.

## Impact

- `src/lib/components/Sidebar.svelte` — where the inset is defined moves out; the strip
  becomes conditional on the collapsed state; selection and tap-highlight suppression
  added to the handle.
- `src/routes/+page.svelte` — receives the shared inset declaration.
- `src/lib/components/RestaurantMap.svelte` — `.location-button`'s `bottom` expressed
  against the shared inset.
- `collapsedPeek()` in `Sidebar.svelte` measures the handle plus the strip. With the strip
  removed from the open sheet's layout, that measurement must still yield the collapsed
  peek while the sheet is open, or dragging an open sheet closed will clamp short.
- `src/app.html` stays untouched. `viewport-fit=cover` is still not adopted; see
  `keep-sheet-clear-of-home-gesture/design.md` — Decision 1.
