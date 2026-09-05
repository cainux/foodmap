<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import RestaurantForm from '$lib/components/RestaurantForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let confirmDialog = $state<HTMLDialogElement>();
	let deleting = $state(false);

	// Without scripting the confirmation is a page of its own, reached by the link
	// below; with scripting the same markup is upgraded to a modal.
	let confirming = $derived(page.url.searchParams.get('confirm') === 'delete');

	$effect(() => {
		if (!confirming || !confirmDialog) return;
		if (confirmDialog.open) confirmDialog.close();
		confirmDialog.showModal();
	});

	const confirmDelete: SubmitFunction = () => {
		deleting = true;
		return async ({ update }) => {
			await update();
			deleting = false;
		};
	};

	function open(event: MouseEvent) {
		event.preventDefault();
		confirmDialog?.showModal();
	}

	function close(event: MouseEvent) {
		event.preventDefault();
		confirmDialog?.close();
	}
</script>

<RestaurantForm
	restaurant={data.restaurant}
	existing={data.all}
	knownTags={data.tags}
	formError={form?.formError}
	invalidField={form?.field}
	submitted={form?.values}
	submitLabel="Save changes"
/>

{#if form?.saved}
	<p class="saved">Saved changes to “{form.saved}”.</p>
{/if}

<a href="?confirm=delete" role="button" class="destructive outline" onclick={open}>
	Delete restaurant
</a>

<dialog bind:this={confirmDialog} open={confirming}>
	<article>
		<header><strong>Delete “{data.restaurant.name}”?</strong></header>
		<p>This cannot be undone. The restaurant is removed from the next publish.</p>
		<footer>
			<a href={page.url.pathname} role="button" onclick={close}>Keep restaurant</a>
			<form method="POST" action="?/delete" use:enhance={confirmDelete}>
				<button type="submit" class="destructive outline" disabled={deleting} aria-busy={deleting}>
					{deleting ? 'Deleting…' : 'Delete'}
				</button>
			</form>
		</footer>
	</article>
</dialog>

<style>
	.saved {
		color: var(--pico-ins-color);
	}

	.destructive {
		--pico-primary: var(--pico-del-color);
		--pico-primary-hover: var(--pico-del-color);
		--pico-primary-focus: var(--pico-del-color);
		--pico-primary-border: var(--pico-del-color);
		width: auto;
	}

	dialog footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--pico-spacing);
	}

	/* The form, not the button, is the footer's flex item. Pico gives a `button` a
	   bottom margin that an `a[role=button]` never gets, so the form ends up taller
	   than the button it wraps and centring lifts Delete above Keep. */
	dialog footer form {
		display: flex;
		margin: 0;
	}

	dialog footer form button {
		margin: 0;
	}
</style>
