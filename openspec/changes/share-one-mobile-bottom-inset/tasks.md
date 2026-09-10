## 1. Move the inset to one declaration

- [ ] 1.1 Declare `--mobile-bottom-inset` on `:root` in `src/routes/+layout.svelte`, `0px`
      by default and `max(env(safe-area-inset-bottom), 28px)` inside `max-width: 768px`
- [ ] 1.2 Remove `--gesture-inset` from `.sidebar` in `Sidebar.svelte` and point the
      collapsed transform, the strip's height and the list's `padding-bottom` at the new
      shared token
- [ ] 1.3 Confirm the desktop `0px` value leaves the >768px panel exactly as it is

## 2. Close the gap in the open sheet

- [ ] 2.1 Give `.gesture-strip` `position: absolute; bottom: 0` when the sheet is open, so
      it leaves the flex column without leaving the DOM (design.md — Decision 2)
- [ ] 2.2 Verify `collapsedPeek()` still reports the collapsed peek while the sheet is
      open — the strip must keep a measurable `offsetHeight` in both states, or dragging
      an open sheet closed will clamp short by the inset
- [ ] 2.3 Check the space between the handle and the first card matches what it was before
      `keep-sheet-clear-of-home-gesture`

## 3. Lift the location button clear

- [ ] 3.1 Replace `.location-button`'s `bottom: 2.5rem` in `RestaurantMap.svelte` with the
      collapsed peek plus a gap, expressed against `--mobile-bottom-inset`
- [ ] 3.2 Confirm the button clears the collapsed sheet with visible space, and does not
      move when the list opens

## 4. Stop the handle behaving like text

- [ ] 4.1 Add `user-select: none` and `-webkit-tap-highlight-color: transparent` to
      `.grab-handle-area` and `.gesture-strip`
- [ ] 4.2 Add a `:focus-visible` outline to `.grab-handle-area` so keyboard focus stays
      visible — `:focus-visible`, not `:focus`, so a tap does not draw a ring

## 5. Verify

- [ ] 5.1 `pnpm check` passes
- [ ] 5.2 Desktop at >768px is unchanged
- [ ] 5.3 On a phone: pressing and dragging across the handle paints no selection and no
      blue line
- [ ] 5.4 On a phone: the location button clears the collapsed sheet
- [ ] 5.5 On a phone, re-check the previous change's behaviour — the collapsed handle
      still clears the home gesture, and dragging an open sheet closed still lands
      correctly (Decision 2 changes how the peek is measured)
- [ ] 5.6 Tapping the handle, dragging it open, and dragging it closed all still work
