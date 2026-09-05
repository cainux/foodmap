<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import { page } from '$app/state';

	let { data, children } = $props();

	const tabs = [
		{ href: '/', label: 'Restaurants', icon: '☰' },
		{ href: '/restaurants/new', label: 'Add', icon: '＋' },
		{ href: '/publish', label: 'Publish', icon: '↑' }
	];

	const titles: [test: (path: string) => boolean, title: string][] = [
		[(p) => p === '/', 'Restaurants'],
		[(p) => p === '/restaurants/new', 'Add restaurant'],
		[(p) => p.startsWith('/restaurants/'), 'Edit restaurant'],
		[(p) => p.startsWith('/publish'), 'Publish']
	];

	let signedIn = $derived(page.url.pathname !== '/auth/login' && data.signedIn);
	let title = $derived(titles.find(([test]) => test(page.url.pathname))?.[1] ?? 'foodmap admin');

	function isActive(href: string) {
		const path = page.url.pathname;
		if (href === '/') {
			return path === '/' || (path.startsWith('/restaurants/') && path !== '/restaurants/new');
		}
		return path.startsWith(href);
	}
</script>

{#if signedIn}
	<header class="app-bar">
		<h1>{title}</h1>
		<form method="POST" action="/auth/logout">
			<button type="submit" class="secondary outline">Log out</button>
		</form>
	</header>
{/if}

<main class="container" class:app-main={signedIn}>
	{@render children()}
</main>

{#if signedIn}
	<nav class="tab-bar" aria-label="Primary">
		<ul>
			{#each tabs as tab (tab.href)}
				<li>
					<a href={tab.href} aria-current={isActive(tab.href) ? 'page' : undefined}>
						<span class="tab-icon" aria-hidden="true">{tab.icon}</span>
						<span class="tab-label">{tab.label}</span>
						{#if tab.href === '/publish' && data.publishPending}
							<span class="pending-dot" aria-hidden="true"></span>
							<span class="visually-hidden">changes pending</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	/* One phone-shaped column at every width; wide viewports centre it rather than
	   stretching to fill. */
	:global(body) {
		--admin-column: 34rem;
		--admin-tab-bar-height: 3.75rem;
	}

	.app-bar {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--pico-spacing);
		width: 100%;
		max-width: var(--admin-column);
		margin-inline: auto;
		padding: 0.75rem var(--pico-spacing);
		padding-top: max(0.75rem, env(safe-area-inset-top));
		background: var(--pico-background-color);
		border-bottom: 1px solid var(--pico-muted-border-color);
	}

	.app-bar h1 {
		margin: 0;
		font-size: 1.25rem;
		line-height: 1.2;
	}

	.app-bar form {
		margin: 0;
	}

	.app-bar button {
		width: auto;
		padding: 0.25rem 0.75rem;
		font-size: 0.8125rem;
	}

	.container {
		max-width: var(--admin-column);
	}

	.app-main {
		padding-top: var(--pico-spacing);
		padding-bottom: calc(var(--admin-tab-bar-height) + env(safe-area-inset-bottom) + 1rem);
	}

	.tab-bar {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		z-index: 2;
		display: block;
		background: var(--pico-background-color);
		border-top: 1px solid var(--pico-muted-border-color);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.tab-bar ul {
		display: flex;
		width: 100%;
		max-width: var(--admin-column);
		margin: 0 auto;
		padding: 0;
		list-style: none;
	}

	.tab-bar li {
		flex: 1;
		margin: 0;
		padding: 0;
	}

	.tab-bar a {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.125rem;
		height: var(--admin-tab-bar-height);
		text-decoration: none;
		color: var(--pico-secondary);
	}

	.tab-bar a[aria-current='page'] {
		color: var(--pico-primary);
		font-weight: bold;
	}

	.tab-icon {
		font-size: 1.125rem;
		line-height: 1;
	}

	.tab-label {
		font-size: 0.75rem;
	}

	.pending-dot {
		position: absolute;
		top: 0.5rem;
		margin-left: 2.5rem;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--pico-primary);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* Severity is expressed per notice, not by one global `[role=alert]` rule:
	   `role="alert"` marks an assertive live region and belongs only on errors. */
	:global(.error) {
		color: var(--pico-del-color);
		font-weight: bold;
	}
</style>
