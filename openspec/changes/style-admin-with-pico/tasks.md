## 1. Load Pico CSS

- [x] 1.1 Check `src/routes/+layout.svelte` in the public site for how Pico CSS is loaded and mirror the same approach in `admin/src/routes/+layout.svelte`
- [x] 1.2 Wrap `{@render children()}` in a `<main class="container">` in the admin layout

## 2. Verify existing pages

- [x] 2.1 Run `pnpm dev` in `admin/` and visually check `/auth/login`
- [x] 2.2 Visually check the restaurant list/publish page(s)
- [x] 2.3 Visually check `restaurants/[id]/edit` and `RestaurantForm.svelte`, fix any layout issues Pico's form styling surfaces
- [x] 2.4 Confirm `role="alert"` error messages remain visually distinguishable
