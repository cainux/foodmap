## Why

Tapping a restaurant while another restaurant's detail popup is open dismisses the open
popup and shows nothing. A second tap on the same restaurant is needed to see it. Moving
between two nearby places therefore costs four taps instead of two.

The cause is listener ordering against a MapLibre default. The `Popup` is created without
`closeOnClick`, which defaults to `true`, and that option registers a map-level `click`
listener **when the popup is added to the map**. The restaurant layer's own click handler
is registered once at map load. The popup's closer is therefore always registered later,
and always runs second:

1. the layer handler sets the newly tapped restaurant as selected;
2. the popup's `closeOnClick` listener fires `onclose`, which sets the selection to
   `null`.

Both run in the same tick, so Svelte only ever renders the final value. The first tap does
select the new restaurant — it is erased before anything is painted.

## What Changes

- Disable the popup's built-in `closeOnClick`, so opening a restaurant is never undone by
  the same tap that opened it.
- Replace the dismissal it provided with an explicit map click handler. `closeButton` is
  `false`, so a background tap is currently the only way to close a card; removing the
  default without a replacement would leave cards stuck open.
- Make that handler **order-independent** rather than relying on registering it before the
  layer handlers. On a map click it queries the rendered features at the tap point and
  clears the selection only when the tap landed on none of the restaurant layers. This is
  the same trap that caused the bug, and ordering is not worth depending on twice.
- Tapping a cluster dismisses the open card. Expanding a cluster changes the view under
  the visitor, which leaves the card describing something no longer in front of them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-map`: the requirement *The name is an interactive target* promises that
  selecting a restaurant "opens that restaurant's detail popup, exactly as if its point
  had been tapped". It does not say what happens when a popup is already open, and the
  current behaviour fails that promise in exactly that case. The requirement is sharpened
  to cover selecting a restaurant while another is already open, and to state when an open
  card is dismissed.

## Impact

- `src/lib/components/RestaurantMap.svelte` — the `Popup` options and one new map-level
  click handler. The only file changed.
- `navigateToRestaurant` already clears the selection explicitly before flying to a
  restaurant, so sidebar taps and the location button stay consistent with the dismissal
  rule and need no change.
- No data, schema, build, or admin change.
