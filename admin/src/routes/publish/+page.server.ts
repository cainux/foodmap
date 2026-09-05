import { fail } from '@sveltejs/kit';
import { getPublishState, recordPublish } from '$lib/server/db/queries';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const state = await getPublishState(platform!.env.DB);
	return {
		lastMutatedAt: state.lastMutatedAt,
		lastPublishedAt: state.lastPublishedAt
	};
};

/**
 * The deploy hook's response identifies the deployment it created. The shape is
 * not part of any contract we control, so every step here is allowed to fail:
 * the identifier is stored for tracing, never interpreted, and never a reason to
 * report an accepted publish as failed.
 */
async function readDeploymentId(res: Response): Promise<string | null> {
	try {
		const body = (await res.json()) as Record<string, unknown>;
		const result = body?.result as Record<string, unknown> | undefined;
		const id = result?.id ?? body?.id;
		return typeof id === 'string' && id ? id : null;
	} catch {
		return null;
	}
}

export const actions: Actions = {
	default: async ({ platform }) => {
		const hookUrl = platform!.env.PAGES_DEPLOY_HOOK_URL;

		const triggeredAt = Date.now();
		const res = await fetch(hookUrl, { method: 'POST' }).catch(() => null);
		if (!res || !res.ok) {
			// The publish time is left untouched, so the changes stay reported as pending.
			return fail(502, {
				error: 'Failed to trigger publish. Your changes are saved and can be retried.'
			});
		}

		await recordPublish(platform!.env.DB, await readDeploymentId(res), triggeredAt);

		return { requested: true };
	}
};
