<script lang="ts">
	import { tools } from '$lib/tools/registry';
	import * as icons from '@lucide/svelte';

	function getIcon(name: string) {
		return (icons as Record<string, unknown>)[name] as typeof icons.File;
	}

	const categories = [
		{ key: 'convert' as const, label: 'Convert' },
		{ key: 'organize' as const, label: 'Organize' },
		{ key: 'optimize' as const, label: 'Optimize' },
		{ key: 'security' as const, label: 'Security' }
	];
</script>

<svelte:head>
	<title>Free PDF Tools — 100% in Your Browser | HTMLtoPDF.pro</title>
	<meta
		name="description"
		content="Free online PDF tools that run entirely in your browser. Merge, compress, convert, split, rotate and protect PDFs. No uploads, no servers, no tracking — your files never leave your device."
	/>
	<meta
		name="keywords"
		content="pdf tools, merge pdf, compress pdf, jpg to pdf, pdf to jpg, split pdf, rotate pdf, free pdf tools, online pdf tools, no upload pdf, private pdf tools, browser pdf tools"
	/>
	<link rel="canonical" href="https://htmltopdf.pro" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://htmltopdf.pro" />
	<meta property="og:title" content="Free PDF Tools — 100% in Your Browser" />
	<meta
		property="og:description"
		content="Merge, compress, convert, split and protect PDFs entirely in your browser. No uploads, no tracking — your files never leave your device."
	/>
	<meta property="og:site_name" content="HTMLtoPDF.pro" />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-16">
	<div class="mb-12 text-center">
		<h1 class="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
			Free PDF Tools — 100% in Your Browser
		</h1>
		<p class="mx-auto mt-3 max-w-lg text-base text-neutral-500 dark:text-neutral-400">
			Every tool runs entirely on your device. No uploads, no servers, no tracking.
			Your files never leave your browser.
		</p>
	</div>

	<div id="all-tools" class="space-y-10">
		{#each categories as cat}
			{@const categoryTools = tools.filter((t) => t.category === cat.key)}
			{#if categoryTools.length > 0}
				<section>
					<h2
						class="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
					>
						{cat.label}
					</h2>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each categoryTools as tool}
							{@const Icon = getIcon(tool.icon)}
							<a
								href="/{tool.slug}"
								class="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all
										hover:border-neutral-300 hover:shadow-md
										dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-neutral-900"
							>
								{#if Icon}
									<div
										class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 transition-colors
												group-hover:bg-neutral-200 group-hover:text-neutral-700
												dark:bg-neutral-800 dark:text-neutral-400
												dark:group-hover:bg-neutral-700 dark:group-hover:text-neutral-200"
									>
										<Icon size={18} />
									</div>
								{/if}
								<div>
									<p
										class="text-sm font-medium text-neutral-800 group-hover:text-neutral-900 dark:text-neutral-200 dark:group-hover:text-neutral-100"
									>
										{tool.name}
									</p>
									<p class="mt-0.5 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
										{tool.description}
									</p>
								</div>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		{/each}
	</div>

	<div class="mt-16 text-center">
		<p class="text-sm text-neutral-400 dark:text-neutral-500">
			The only PDF toolkit that <strong class="font-medium text-neutral-600 dark:text-neutral-300">never touches your files</strong>.
		</p>
	</div>
</div>
