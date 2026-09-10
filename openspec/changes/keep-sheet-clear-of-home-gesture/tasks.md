## 1. Establish the inset

- [x] 1.1 Define the gesture-clearance inset once in `Sidebar.svelte` as a custom property
      set to `max(env(safe-area-inset-bottom), 28px)`, scoped to the mobile breakpoint so
      the desktop slide-in panel is unaffected
- [x] 1.2 Confirm `src/app.html` is left untouched — `viewport-fit=cover` is deliberately
      not adopted (design.md — Decision 1)

## 2. Lift the handle clear of the gesture strip

- [x] 2.1 Add the inset to the collapsed transform so the sheet reveals `28px + inset`
      instead of `28px`
- [x] 2.2 Add the inert strip below `.grab-handle-area`, inside the sheet and outside the
      handle area, so it inherits neither the pointer handlers nor `touch-action: none`
- [x] 2.3 Verify the sheet's background still reaches the bottom of the screen with no map
      visible beneath it
- [x] 2.4 Check the drag maths still resolves: `onPointerMove` computes `collapsedOffset`
      from `sidebarHeight - 28`, which must track the new peek or the sheet will jump on
      first drag

## 3. Make a stolen gesture revert

- [x] 3.1 Give `onpointercancel` its own handler that clears `dragging`, restores the
      transition, and clears the inline transform without toggling
- [x] 3.2 Leave `onpointerup` committing as it does today, including the tap-to-toggle
      branch at `Math.abs(deltaY) < 10`

## 4. Clear the open list's content

- [ ] 4.1 Add the inset to `.sidebar-scroll`'s `padding-bottom` so the last restaurant card
      sits above the gesture strip when the list is open

## 5. Verify

- [ ] 5.1 `pnpm check` passes
- [ ] 5.2 On a phone with the site installed to the home screen: swipe up from the bottom
      edge with the list collapsed — the list stays collapsed, and is still collapsed on
      returning to the app
- [ ] 5.3 Tapping and dragging the handle still open and close the list
- [ ] 5.4 With the list open and scrolled to the end, the final card is fully visible and
      tappable
- [ ] 5.5 Desktop at >768px is unchanged — the panel still slides in from the left with no
      stray bottom padding
