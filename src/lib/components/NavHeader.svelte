<script lang="ts">
	import { tools } from '$lib/tools/registry';
	import { page } from '$app/state';

	let menuOpen = $state(false);

	const currentPath = $derived(page.url.pathname);
</script>

<nav class="border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
		<a
			href="/"
			class="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
		>
			HTMLtoPDF<span class="text-neutral-400">.pro</span>
		</a>

		<div class="hidden items-center gap-1 md:flex">
			{#each tools.slice(0, 6) as tool}
				<a
					href="/{tool.slug}"
					class="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors
							{currentPath === `/${tool.slug}`
						? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
						: 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200'}"
				>
					{tool.name}
				</a>
			{/each}
			{#if tools.length > 6}
				<a
					href="/#all-tools"
					class="rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700
							dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
				>
					All Tools
				</a>
			{/if}
		</div>

		<button
			class="rounded-md p-2 text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
			onclick={() => (menuOpen = !menuOpen)}
			aria-label="Toggle menu"
		>
			<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				{#if menuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>

	{#if menuOpen}
		<div class="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 md:hidden">
			<div class="grid grid-cols-2 gap-1">
				{#each tools as tool}
					<a
						href="/{tool.slug}"
						class="rounded-md px-3 py-2 text-sm transition-colors
								{currentPath === `/${tool.slug}`
							? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
							: 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'}"
						onclick={() => (menuOpen = false)}
					>
						{tool.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
