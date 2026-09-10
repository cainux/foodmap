## 1. Remove the trigger

- [x] 1.1 Change `font-size` from `0.95rem` to `1rem` in the
      `.search-box input[type='search']` rule in `src/routes/+page.svelte`
- [x] 1.2 Confirm the search field still fits its pill at 16px — it sits in a flex row
      beside a 36px button inside a `calc(100vw - 2rem)` container on mobile, so check the
      placeholder is not truncated on a narrow phone

## 2. Confirm nothing else is below the threshold

- [ ] 2.1 Verify the search field is still the only form control on the public site
- [ ] 2.2 Confirm `src/app.html` is unchanged — no `maximum-scale` or `user-scalable`
      is added (proposal.md — What Changes)

## 3. Verify

- [ ] 3.1 `pnpm check` passes
- [ ] 3.2 On a phone with the site installed to the home screen: tapping into the search
      field leaves the page at the same zoom
- [ ] 3.3 Typing a query still filters both the map markers and the list, and still opens
      the sidebar on focus
