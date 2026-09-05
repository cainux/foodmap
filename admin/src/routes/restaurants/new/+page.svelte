<script lang="ts">
	import RestaurantForm from '$lib/components/RestaurantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Bumped to re-mount the form, which is how "Add another" gets a blank one.
	let formKey = $state(0);
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!form?.created || !dialog) return;
		// Server-rendered with `open` so it works without scripting; upgrade it to a
		// modal so the confirmation takes focus.
		if (dialog.open) dialog.close();
		dialog.showModal();
	});

	function addAnother(event: MouseEvent) {
		event.preventDefault();
		dialog?.close();
		formKey += 1;
	}
</script>

{#key formKey}
	<RestaurantForm
		existing={data.all}
		knownTags={data.tags}
		formError={form?.formError}
		invalidField={form?.field}
		submitted={form?.values}
		submitLabel="Add restaurant"
	/>
{/key}

{#if form?.created}
	<dialog bind:this={dialog} open>
		<article>
			<header><strong>Restaurant added</strong></header>
			<p>“{form.created}” was saved.</p>
			<footer>
				<a href="/" role="button" class="secondary">Back to list</a>
				<a href="/restaurants/new" role="button" onclick={addAnother}>Add another</a>
			</footer>
		</article>
	</dialog>
{/if}
