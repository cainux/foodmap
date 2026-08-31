// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
				ALLOWED_HANDLES: string;
				ATPROTO_PRIVATE_KEY: string;
				PAGES_DEPLOY_HOOK_URL: string;
			};
		}
	}
}

export {};
