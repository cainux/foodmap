## 1. Stop the popup closing its own opening tap

- [x] 1.1 Pass `closeOnClick={false}` to the `Popup` in `RestaurantMap.svelte`
- [x] 1.2 Confirm `onclose` is still wired, so any other close path clears
      `selectedRestaurant`

## 2. Own dismissal explicitly

- [x] 2.1 Name the restaurant-layer set once in the component and use it both for the
      existing layer click registration and for the new dismissal handler, so the two
      cannot drift
- [x] 2.2 Add a map-level `click` handler that hit-tests the tap point with
      `queryRenderedFeatures` and clears `selectedRestaurant` only when the tap landed on
      neither `unclustered-point` nor `restaurant-label`
- [x] 2.3 Leave `clusters` out of the suppressing set, so a group tap dismisses the card
      while the existing cluster handler expands it (design.md — Decision 3)
- [x] 2.4 Verify the handler is order-independent — it must behave the same whether it is
      registered before or after the layer handlers

## 3. Verify

- [x] 3.1 `pnpm check` passes
- [x] 3.2 Tapping a second restaurant while a card is open shows the second card from that
      single tap
- [x] 3.3 The same holds when the second restaurant is selected by its label rather than
      its point
- [x] 3.4 Tapping the same restaurant again leaves its card open
- [x] 3.5 Tapping empty map dismisses the card; tapping a group dismisses it and zooms
- [x] 3.6 Panning the map with a card open leaves the card open
- [x] 3.7 Selecting a restaurant from the sidebar list still flies to it and opens its card

3.2-3.7 were verified in a desktop browser against `vite dev`, driving the map with
synthetic pointer events. Touch and mouse both reach the same MapLibre click dispatch,
so the behaviour is the same, but this is not a check on a physical phone.
