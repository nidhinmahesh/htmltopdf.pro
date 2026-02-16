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

	const webAppSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: tool.name,
		url: `https://htmltopdf.pro/${tool.slug}`,
		description: tool.metaDescription,
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires a modern web browser',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		featureList: [
			'100% client-side processing',
			'No file uploads to servers',
			'No sign-up required',
			'No ads or tracking',
			'Free with no usage limits',
			'Works offline after loading',
			'Open source'
		],
		creator: {
			'@type': 'Organization',
			name: 'HTMLtoPDF.pro',
			url: 'https://htmltopdf.pro'
		}
	});

	const faqSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: tool.faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer
			}
		}))
	});

	const breadcrumbSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'PDF Tools',
				item: 'https://htmltopdf.pro'
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: tool.name,
				item: `https://htmltopdf.pro/${tool.slug}`
			}
		]
	});
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

	{@html `<script type="application/ld+json">${webAppSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
	{@html `<script type="application/ld+json">${breadcrumbSchema}</script>`}
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-8">
	<nav class="mb-6 text-xs text-neutral-400 dark:text-neutral-500" aria-label="Breadcrumb">
		<a href="/" class="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">PDF Tools</a>
		<span class="mx-1.5">/</span>
		<span class="text-neutral-600 dark:text-neutral-300">{tool.name}</span>
	</nav>

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

	{#if tool.faqs.length > 0}
		<section class="mt-12">
			<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
				Frequently asked questions
			</h2>
			<div class="space-y-4">
				{#each tool.faqs as faq}
					<details class="group rounded-lg border border-neutral-200 dark:border-neutral-800">
						<summary
							class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-neutral-700
									dark:text-neutral-300 [&::-webkit-details-marker]:hidden"
						>
							{faq.question}
							<svg
								class="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-180"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</summary>
						<p class="px-4 pb-3 text-sm text-neutral-500 dark:text-neutral-400">
							{faq.answer}
						</p>
					</details>
				{/each}
			</div>
		</section>
	{/if}
</div>
