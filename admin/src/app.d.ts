// See https://svelte.dev/docs/kit/types#app.d.ts

import type { OAuthSession } from '@atproto/oauth-client';

declare global {
	namespace App {
		interface Locals {
			session: OAuthSession;
		}
	}

	// Bindings and secrets, read via `import { env } from 'cloudflare:workers'`.
	namespace Cloudflare {
		interface Env {
			DB: D1Database;
			ALLOWED_HANDLES: string;
			PAGES_DEPLOY_HOOK_URL: string;
			SESSION_ENCRYPTION_KEY: string;
		}
	}
}

export {};
