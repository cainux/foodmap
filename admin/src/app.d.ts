// See https://svelte.dev/docs/kit/types#app.d.ts

import type { OAuthSession } from '@atproto/oauth-client';

declare global {
	namespace App {
		interface Locals {
			session: OAuthSession;
		}
		interface Platform {
			env: {
				DB: D1Database;
				ALLOWED_HANDLES: string;
				PAGES_DEPLOY_HOOK_URL: string;
			};
		}
	}
}

export {};
