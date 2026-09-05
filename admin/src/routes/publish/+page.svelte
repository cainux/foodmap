<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let publishing = $state(false);

	let status = $derived.by(() => {
		if (data.lastPublishedAt === null) return 'never';
		if (data.lastMutatedAt !== null && data.lastMutatedAt > data.lastPublishedAt) return 'pending';
		return 'current';
	});

	function when(at: number | null) {
		if (at === null) return 'never';
		return new Date(at).toLocaleString();
	}

	const publish: SubmitFunction = () => {
		publishing = true;
		return async ({ update }) => {
			await update();
			publishing = false;
		};
	};
</script>

<p>
	Admin writes are saved to the database immediately. The public site only rebuilds when you
	publish.
</p>

<article>
	{#if status === 'never'}
		<strong>Never published</strong>
		<p>The public site has not been published from this admin yet.</p>
	{:else if status === 'pending'}
		<strong>Changes not yet published</strong>
		<p>Restaurant data has changed since the last publish.</p>
	{:else}
		<strong>Up to date</strong>
		<p>Nothing has changed since the last publish.</p>
	{/if}

	<dl>
		<dt>Data last changed</dt>
		<dd>{when(data.lastMutatedAt)}</dd>
		<dt>Last published</dt>
		<dd>{when(data.lastPublishedAt)}</dd>
	</dl>
</article>

<form method="POST" use:enhance={publish}>
	<button type="submit" disabled={publishing} aria-busy={publishing}>
		{publishing ? 'Requesting…' : 'Publish now'}
	</button>
</form>

{#if form?.requested}
	<p class="requested">
		Publish requested. Cloudflare accepted the rebuild — check the Pages dashboard to confirm it
		completed.
	</p>
{/if}

{#if form?.error}
	<p role="alert" class="error">{form.error}</p>
{/if}

<style>
	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.25rem var(--pico-spacing);
		margin: var(--pico-spacing) 0 0;
	}

	dt {
		color: var(--pico-muted-color);
	}

	dd {
		margin: 0;
	}

	.requested {
		color: var(--pico-ins-color);
	}
</style>
