<script lang="ts">
	let { form } = $props();
</script>

<h1>Sign in with Bluesky</h1>

<form method="POST">
	<label>
		Bluesky handle
		<input name="handle" type="text" placeholder="you.bsky.social" required />
	</label>
	<button type="submit">Sign in</button>
</form>

{#if form?.error}
	<p role="alert">{form.error}</p>
{/if}
