import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ platform }) => {
		const hookUrl = platform!.env.PAGES_DEPLOY_HOOK_URL;

		const res = await fetch(hookUrl, { method: 'POST' }).catch(() => null);
		if (!res || !res.ok) {
			return fail(502, { error: 'Failed to trigger publish. Your changes are saved and can be retried.' });
		}

		return { success: true };
	}
};
