<script lang="ts">
	import { getRelatedTools, type Tool } from '$lib/tools/registry';
	import * as icons from '@lucide/svelte';

	let { slug }: { slug: string } = $props();

	const related = $derived(getRelatedTools(slug));

	function getIcon(name: string) {
		return (icons as Record<string, unknown>)[name] as typeof icons.File;
	}
</script>

{#if related.length > 0}
	<section class="mt-12">
		<h2 class="mb-4 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Related Tools
		</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{#each related as tool}
				{@const Icon = getIcon(tool.icon)}
				<a
					href="/{tool.slug}"
					class="group flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 transition-all
							hover:border-neutral-300 hover:shadow-sm
							dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
				>
					{#if Icon}
						<Icon
							size={20}
							class="shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 dark:text-neutral-500 dark:group-hover:text-neutral-300"
						/>
					{/if}
					<div>
						<p class="text-sm font-medium text-neutral-700 dark:text-neutral-200">
							{tool.name}
						</p>
						<p class="text-xs text-neutral-400 dark:text-neutral-500">{tool.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>
{/if}
