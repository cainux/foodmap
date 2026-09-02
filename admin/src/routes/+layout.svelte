<script lang="ts">
	import '@picocss/pico/css/pico.min.css';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';

	let { data, children } = $props();

	let menuOpen = $state(false);

	afterNavigate(() => {
		menuOpen = false;
	});

	const links = [
		{ href: '/', label: 'Restaurants' },
		{ href: '/restaurants/new', label: 'Add Restaurant' },
		{ href: '/publish', label: 'Publish' }
	];

	function isActive(href: string) {
		const path = page.url.pathname;
		if (href === '/') {
			return path === '/' || (path.startsWith('/restaurants/') && !path.startsWith('/restaurants/new'));
		}
		return path.startsWith(href);
	}
</script>

{#if page.url.pathname !== '/auth/login'}
	<nav class="admin-nav container">
		<div class="admin-nav-bar">
			<strong>foodmap admin</strong>
			<button
				class="menu-toggle outline"
				type="button"
				aria-expanded={menuOpen}
				aria-label="Toggle navigation"
				onclick={() => (menuOpen = !menuOpen)}
			>
				☰
			</button>
		</div>
		<div class="admin-nav-links" class:open={menuOpen}>
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			{#if data.handle}
				<div class="admin-nav-identity">
					<span>{data.handle}</span>
					<form method="POST" action="/auth/logout">
						<button type="submit" class="secondary outline">Log out</button>
					</form>
				</div>
			{/if}
		</div>
	</nav>
{/if}

<main class="container">
	{@render children()}
</main>

<style>
	:global([role='alert']) {
		color: var(--pico-del-color);
		font-weight: bold;
	}

	.admin-nav {
		border-bottom: 1px solid var(--pico-muted-border-color);
		padding-block: 1rem;
		padding-inline-end: 0;
	}

	.admin-nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.menu-toggle {
		width: auto;
		padding: 0.25rem 0.75rem;
	}

	.admin-nav-links {
		display: none;
		flex-direction: column;
		align-items: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	.admin-nav-links.open {
		display: flex;
	}

	.admin-nav-links ul {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.admin-nav-links a[aria-current='page'] {
		font-weight: bold;
	}

	.admin-nav-identity {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.admin-nav-identity form {
		margin: 0;
	}

	@media (min-width: 900px) {
		.admin-nav-bar {
			gap: 2rem;
		}

		.menu-toggle {
			display: none;
		}

		.admin-nav-links {
			display: flex !important;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			flex: 1;
			margin-top: 0;
		}

		.admin-nav-links ul {
			flex-direction: row;
			gap: 1.5rem;
		}
	}
</style>
