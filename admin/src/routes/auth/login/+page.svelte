<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { form } = $props();

	let signingIn = $state(false);

	const signIn: SubmitFunction = () => {
		signingIn = true;
		return async ({ update }) => {
			await update();
			signingIn = false;
		};
	};
</script>

<h1>Sign in with Bluesky</h1>

<form method="POST" use:enhance={signIn}>
	<label>
		Bluesky handle
		<input name="handle" type="text" placeholder="you.bsky.social" required />
	</label>
	<button type="submit" disabled={signingIn} aria-busy={signingIn}>
		{signingIn ? 'Signing in…' : 'Sign in'}
	</button>
</form>

{#if form?.error}
	<p role="alert" class="error">{form.error}</p>
{/if}
