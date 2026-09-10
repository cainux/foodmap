<script lang="ts">
	import { flip } from 'svelte/animate';
	import { calculateDistance } from '$lib/geo';

	interface Restaurant {
		name: string;
		branch?: string;
		url: string;
		coordinates: { lat: number; lng: number } | null;
		tags?: string[];
		comment?: string;
	}

	let {
		restaurants,
		open,
		userLocation,
		onCardClick,
		onToggle
	}: {
		restaurants: Restaurant[];
		open: boolean;
		userLocation: { lat: number; lng: number } | null;
		onCardClick: (coords: { lat: number; lng: number }) => void;
		onToggle: () => void;
	} = $props();

	let sidebarEl: HTMLElement | undefined = $state();
	let grabHandleAreaEl: HTMLElement | undefined = $state();
	let gestureStripEl: HTMLElement | undefined = $state();
	let dragStartY = 0;
	let dragging = false;

	function onPointerDown(e: PointerEvent) {
		if (!sidebarEl) return;
		dragging = true;
		dragStartY = e.clientY;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		sidebarEl.style.transition = 'none';
	}

	/**
	 * How much of the sheet the collapsed state reveals: the grab handle plus the inert
	 * gesture strip beneath it. Measured rather than hardcoded so it tracks the CSS
	 * `--gesture-inset`, which is an `env()` expression the browser resolves - a stale
	 * constant here would make the sheet jump on the first drag.
	 */
	function collapsedPeek(): number {
		return (grabHandleAreaEl?.offsetHeight ?? 0) + (gestureStripEl?.offsetHeight ?? 0);
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || !sidebarEl) return;
		const deltaY = e.clientY - dragStartY;
		const sidebarHeight = sidebarEl.offsetHeight;
		const peek = collapsedPeek();
		const collapsedOffset = sidebarHeight - peek;

		if (open) {
			const clamped = Math.max(0, Math.min(deltaY, collapsedOffset));
			sidebarEl.style.transform = `translateY(${clamped}px)`;
		} else {
			const clamped = Math.max(-collapsedOffset, Math.min(deltaY, 0));
			sidebarEl.style.transform = `translateY(calc(100% - ${peek}px + ${clamped}px))`;
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging || !sidebarEl) return;
		dragging = false;
		sidebarEl.style.transition = '';
		sidebarEl.style.transform = '';

		const deltaY = e.clientY - dragStartY;
		if (Math.abs(deltaY) < 10) {
			onToggle();
		} else if (open && deltaY > 10) {
			onToggle();
		} else if (!open && deltaY < -10) {
			onToggle();
		}
	}

	/**
	 * `pointercancel` means the OS took the gesture away - it was never released to
	 * authorise a toggle. Undo the drag and let the sheet animate back to whichever
	 * state `open` still holds.
	 */
	function onPointerCancel() {
		if (!dragging || !sidebarEl) return;
		dragging = false;
		sidebarEl.style.transition = '';
		sidebarEl.style.transform = '';
	}

	function distanceLabel(coords: { lat: number; lng: number }): string {
		if (!userLocation) return '';
		const km = calculateDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
		return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
	}

	function handleKeyPress(event: KeyboardEvent, coords: { lat: number; lng: number }) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onCardClick(coords);
		}
	}
</script>

<aside class="sidebar" class:open aria-hidden={!open} bind:this={sidebarEl}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="grab-handle-area"
		bind:this={grabHandleAreaEl}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerCancel}
		role="button"
		tabindex="0"
		aria-label={open ? 'Collapse panel' : 'Expand panel'}
		onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
	>
		<div class="grab-handle"></div>
	</div>
	<!-- Inert clearance for the OS home gesture: outside .grab-handle-area, so it carries
	     neither the pointer handlers nor touch-action: none. -->
	<div class="gesture-strip" bind:this={gestureStripEl}></div>
	<div class="sidebar-scroll">
		{#each restaurants as restaurant (restaurant.url)}
			<div
				class="restaurant-card"
				onclick={() => onCardClick(restaurant.coordinates!)}
				onkeydown={(e) => handleKeyPress(e, restaurant.coordinates!)}
				role="button"
				tabindex={open ? 0 : -1}
				animate:flip={{ duration: 300 }}
			>
				<div class="card-header">
					<h3>
						{restaurant.name}
						{#if restaurant.branch}<span class="branch">{restaurant.branch}</span>{/if}
					</h3>
					{#if userLocation}
						<span class="distance">{distanceLabel(restaurant.coordinates!)}</span>
					{/if}
				</div>
				{#if restaurant.tags && restaurant.tags.length > 0}
					<div class="tags">
						{#each restaurant.tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
				{#if restaurant.comment}
					<p class="comment">{restaurant.comment}</p>
				{/if}
			</div>
		{:else}
			<p class="empty">No restaurants match your search.</p>
		{/each}
	</div>
</aside>

<style>
	.sidebar {
		position: absolute;
		z-index: 20;
		background: var(--pico-card-background-color);
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: transform 0.3s ease;
	}

	.grab-handle-area {
		display: none;
	}

	.grab-handle {
		display: none;
	}

	.gesture-strip {
		display: none;
	}

	.sidebar-scroll {
		overflow-y: auto;
		padding: 1rem;
		flex: 1;
		-webkit-overflow-scrolling: touch;
	}

	/* Desktop: left slide-in panel */
	.sidebar {
		top: 0;
		left: 0;
		width: 360px;
		max-width: 85vw;
		height: 100%;
		transform: translateX(-100%);
	}

	.sidebar.open {
		transform: translateX(0);
	}

	/* Leave room for the floating search box above the list */
	.sidebar-scroll {
		padding-top: 4.75rem;
	}

	.restaurant-card {
		padding: 0.85rem 1rem;
		margin-bottom: 0.75rem;
		cursor: pointer;
		background: var(--pico-card-background-color);
		border: 1px solid var(--pico-muted-border-color);
		border-radius: var(--pico-border-radius);
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.restaurant-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.restaurant-card:active {
		transform: translateY(0);
	}

	.card-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.restaurant-card h3 {
		margin: 0;
		font-size: 1.05rem;
	}

	.branch {
		font-size: 0.8rem;
		font-weight: normal;
		color: var(--pico-muted-color);
	}

	.distance {
		flex-shrink: 0;
		font-size: 0.75rem;
		color: var(--pico-muted-color);
		white-space: nowrap;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.4rem;
	}

	.tag {
		display: inline-block;
		padding: 0.05rem 0.4rem;
		font-size: 0.6rem;
		background-color: var(--pico-primary);
		color: white;
		border-radius: 8px;
	}

	.comment {
		margin: 0.4rem 0 0 0;
		font-size: 0.8rem;
		font-style: italic;
		color: var(--pico-muted-color);
	}

	.empty {
		color: var(--pico-muted-color);
		text-align: center;
		margin-top: 2rem;
	}

	/* Mobile: bottom sheet */
	@media (max-width: 768px) {
		.sidebar {
			/* Clearance for the OS swipe-up home gesture strip. env() only reports a real
			   value under viewport-fit=cover, which this site deliberately does not set
			   (design.md - Decision 1), so the 28px floor carries the fix today. */
			--gesture-inset: max(env(safe-area-inset-bottom), 28px);
			top: auto;
			bottom: 0;
			left: 0;
			width: 100%;
			max-width: none;
			height: 70dvh;
			border-radius: 16px 16px 0 0;
			/* Collapsed: reveal the grab handle plus the inert strip below it, so the
			   handle sits above the OS gesture strip */
			transform: translateY(calc(100% - 28px - var(--gesture-inset)));
		}

		.sidebar.open {
			transform: translateY(0);
		}

		.grab-handle-area {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			padding: 12px 0;
			cursor: grab;
			touch-action: none;
			background: transparent;
			border: none;
		}

		.grab-handle {
			display: block;
			width: 40px;
			height: 4px;
			border-radius: 2px;
			background: var(--pico-muted-border-color);
		}

		.gesture-strip {
			display: block;
			flex-shrink: 0;
			height: var(--gesture-inset);
		}

		.sidebar-scroll {
			padding-top: 0.5rem;
			/* Keep the last card - itself a tap target - out of the gesture strip */
			padding-bottom: var(--gesture-inset);
		}
	}
</style>
