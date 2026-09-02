<script lang="ts">
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<h1>Publish</h1>

<p>
	Admin writes are saved to the database immediately but the public site only rebuilds when you
	publish. Publish now to push all accumulated changes live.
</p>

<form method="POST">
	<button type="submit">Publish now</button>
</form>

{#if form?.success}
	<p>Publish triggered. The public site will finish rebuilding in about a minute.</p>
{/if}

{#if form?.error}
	<p role="alert">{form.error}</p>
{/if}
