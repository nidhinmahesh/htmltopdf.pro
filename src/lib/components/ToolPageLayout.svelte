<script lang="ts">
	import { type Snippet } from 'svelte';
	import RelatedTools from './RelatedTools.svelte';
	import type { Tool } from '$lib/tools/registry';

	let {
		tool,
		children,
		article
	}: {
		tool: Tool;
		children: Snippet;
		article?: Snippet;
	} = $props();
</script>

<svelte:head>
	<title>{tool.metaTitle}</title>
	<meta name="description" content={tool.metaDescription} />
	<meta name="keywords" content={tool.keywords.join(', ')} />
	<link rel="canonical" href="https://htmltopdf.pro/{tool.slug}" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://htmltopdf.pro/{tool.slug}" />
	<meta property="og:title" content={tool.metaTitle} />
	<meta property="og:description" content={tool.metaDescription} />
	<meta property="og:site_name" content="HTMLtoPDF.pro" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={tool.metaTitle} />
	<meta name="twitter:description" content={tool.metaDescription} />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: tool.name,
		url: `https://htmltopdf.pro/${tool.slug}`,
		description: tool.metaDescription,
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires a modern web browser',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	})}</script>`}
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<div class="mb-8 text-center">
		<h1 class="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
			{tool.name}
		</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			{tool.description} — free, private, no upload required
		</p>
	</div>

	{@render children()}

	<RelatedTools slug={tool.slug} />

	{#if article}
		<article
			class="mt-12 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400"
		>
			{@render article()}
		</article>
	{/if}
</div>
