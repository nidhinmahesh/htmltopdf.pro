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

	const webAppSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'HTMLtoPDF.pro',
		url: 'https://htmltopdf.pro',
		description:
			'Free online PDF tools that run entirely in your browser. Merge, compress, convert, split, rotate and protect PDFs. No uploads, no servers, no tracking.',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires a modern web browser',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		featureList: [
			'14 free PDF tools',
			'100% client-side processing',
			'No file uploads',
			'No sign-up or account required',
			'No ads or tracking',
			'Merge PDF files',
			'Compress PDF files',
			'Convert JPG to PDF',
			'Convert PDF to JPG',
			'Split PDF files',
			'Rotate PDF pages',
			'Add page numbers to PDF',
			'Watermark PDF',
			'Convert PDF to PNG',
			'Convert PNG to PDF',
			'Password protect PDF',
			'Unlock PDF',
			'Reorder PDF pages',
			'HTML to PDF conversion',
			'Open source'
		],
		creator: {
			'@type': 'Organization',
			name: 'HTMLtoPDF.pro',
			url: 'https://htmltopdf.pro'
		}
	});

	const orgSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'HTMLtoPDF.pro',
		url: 'https://htmltopdf.pro',
		sameAs: ['https://github.com/nidhinmahesh/htmltopdf.pro']
	});

	const faqSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: [
			{
				'@type': 'Question',
				name: 'Are the PDF tools really free?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Yes. Every tool on HTMLtoPDF.pro is completely free with no usage limits, no sign-up, and no hidden fees. All processing runs in your browser — there are no servers to pay for.'
				}
			},
			{
				'@type': 'Question',
				name: 'Do my files get uploaded to a server?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'No. HTMLtoPDF.pro runs 100% in your browser. Your files never leave your device. The tools use client-side JavaScript libraries (pdf-lib, PDF.js) that process everything locally.'
				}
			},
			{
				'@type': 'Question',
				name: 'How is this different from iLovePDF or other PDF tools?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'Unlike iLovePDF, Smallpdf, or PDF2Go, HTMLtoPDF.pro never uploads your files to any server. Everything processes locally in your browser. There are no ads, no sign-up requirements, no file size limits, and the entire project is open source.'
				}
			},
			{
				'@type': 'Question',
				name: 'What PDF tools are available?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'HTMLtoPDF.pro offers 14 free tools: Merge PDF, Compress PDF, JPG to PDF, PDF to JPG, Split PDF, Rotate PDF, Add Page Numbers, Watermark PDF, PDF to PNG, PNG to PDF, Protect PDF, Unlock PDF, Reorder Pages, and HTML to PDF.'
				}
			},
			{
				'@type': 'Question',
				name: 'Is there a file size limit?',
				acceptedAnswer: {
					'@type': 'Answer',
					text: 'There is no artificial file size limit. Since all processing happens in your browser, the only limit is your device memory. Modern browsers can handle files of several hundred megabytes.'
				}
			}
		]
	});
</script>

<svelte:head>
	<title>Free PDF Tools — 100% in Your Browser | HTMLtoPDF.pro</title>
	<meta
		name="description"
		content="Free online PDF tools that run entirely in your browser. Merge, compress, convert, split, rotate and protect PDFs. No uploads, no servers, no tracking — your files never leave your device."
	/>
	<meta
		name="keywords"
		content="pdf tools, free pdf tools, merge pdf, compress pdf, jpg to pdf, pdf to jpg, split pdf, rotate pdf, online pdf tools, no upload pdf, private pdf tools, browser pdf tools, pdf converter, pdf editor online free, combine pdf, reduce pdf size, image to pdf, pdf to image"
	/>
	<link rel="canonical" href="https://htmltopdf.pro" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://htmltopdf.pro" />
	<meta property="og:title" content="Free PDF Tools — 100% in Your Browser | HTMLtoPDF.pro" />
	<meta
		property="og:description"
		content="14 free PDF tools that never touch your files. Merge, compress, convert, split and protect PDFs entirely in your browser. No uploads, no tracking."
	/>
	<meta property="og:site_name" content="HTMLtoPDF.pro" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Free PDF Tools — 100% in Your Browser" />
	<meta
		name="twitter:description"
		content="14 free PDF tools that never touch your files. Merge, compress, convert, split and protect PDFs entirely in your browser."
	/>

	{@html `<script type="application/ld+json">${webAppSchema}</script>`}
	{@html `<script type="application/ld+json">${orgSchema}</script>`}
	{@html `<script type="application/ld+json">${faqSchema}</script>`}
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

<article class="mx-auto max-w-3xl px-4 pb-16">
	<div class="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Why HTMLtoPDF.pro? The private alternative to iLovePDF and Smallpdf
		</h2>
		<p class="mb-3">
			Every time you use iLovePDF, Smallpdf, PDF2Go, or similar services, your files are uploaded to their
			servers. Your contracts, tax documents, medical records, and private photos pass through third-party
			infrastructure. HTMLtoPDF.pro is different: <strong>every tool runs entirely in your browser</strong>.
			Your files never leave your device. There is no server to upload to.
		</p>
		<p class="mb-3">
			HTMLtoPDF.pro offers 14 free PDF tools: merge PDF, compress PDF, convert JPG to PDF, convert PDF
			to JPG, split PDF, rotate PDF pages, add page numbers, add watermarks, convert PDF to PNG, convert
			PNG to PDF, password-protect PDF, unlock PDF, reorder PDF pages, and convert HTML to PDF. Every tool
			is free, requires no sign-up, has no ads, and processes files 100% client-side using open-source
			JavaScript libraries.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			How client-side PDF processing works
		</h3>
		<p class="mb-3">
			HTMLtoPDF.pro uses two open-source libraries that run entirely in the browser:
			<strong>pdf-lib</strong> for creating, merging, splitting, rotating, and modifying PDF documents, and
			<strong>PDF.js</strong> (Mozilla's PDF renderer) for rendering PDF pages as images. Both libraries process
			files using your device's CPU and memory — no internet connection is needed after the page loads.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Comparison: HTMLtoPDF.pro vs iLovePDF vs Smallpdf vs PDF2Go
		</h3>
		<div class="mb-3 overflow-x-auto">
			<table class="w-full text-left text-xs">
				<thead>
					<tr class="border-b border-neutral-200 dark:border-neutral-800">
						<th class="py-2 pr-4 font-medium text-neutral-700 dark:text-neutral-300">Feature</th>
						<th class="py-2 pr-4 font-medium text-neutral-700 dark:text-neutral-300">HTMLtoPDF.pro</th>
						<th class="py-2 pr-4 font-medium text-neutral-700 dark:text-neutral-300">iLovePDF</th>
						<th class="py-2 pr-4 font-medium text-neutral-700 dark:text-neutral-300">Smallpdf</th>
					</tr>
				</thead>
				<tbody class="text-neutral-500 dark:text-neutral-400">
					<tr class="border-b border-neutral-100 dark:border-neutral-800/50">
						<td class="py-2 pr-4">File privacy</td>
						<td class="py-2 pr-4">100% browser-side</td>
						<td class="py-2 pr-4">Server upload</td>
						<td class="py-2 pr-4">Server upload</td>
					</tr>
					<tr class="border-b border-neutral-100 dark:border-neutral-800/50">
						<td class="py-2 pr-4">Sign-up required</td>
						<td class="py-2 pr-4">Never</td>
						<td class="py-2 pr-4">For batch</td>
						<td class="py-2 pr-4">After 2 tasks</td>
					</tr>
					<tr class="border-b border-neutral-100 dark:border-neutral-800/50">
						<td class="py-2 pr-4">Ads</td>
						<td class="py-2 pr-4">None</td>
						<td class="py-2 pr-4">Yes</td>
						<td class="py-2 pr-4">Yes</td>
					</tr>
					<tr class="border-b border-neutral-100 dark:border-neutral-800/50">
						<td class="py-2 pr-4">Price</td>
						<td class="py-2 pr-4">Free forever</td>
						<td class="py-2 pr-4">Freemium</td>
						<td class="py-2 pr-4">Freemium</td>
					</tr>
					<tr class="border-b border-neutral-100 dark:border-neutral-800/50">
						<td class="py-2 pr-4">File size limit</td>
						<td class="py-2 pr-4">Browser memory only</td>
						<td class="py-2 pr-4">100 MB free</td>
						<td class="py-2 pr-4">Limited free</td>
					</tr>
					<tr>
						<td class="py-2 pr-4">Open source</td>
						<td class="py-2 pr-4">Yes</td>
						<td class="py-2 pr-4">No</td>
						<td class="py-2 pr-4">No</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Who is HTMLtoPDF.pro for?
		</h3>
		<ul class="mb-3 list-disc space-y-1 pl-5">
			<li>Anyone who needs to merge, split, or compress PDFs without creating an account</li>
			<li>Professionals handling sensitive documents (contracts, financials, medical records)</li>
			<li>Students and educators converting images and documents to PDF for free</li>
			<li>Developers who prefer open-source tools they can inspect and verify</li>
			<li>Privacy-conscious users who refuse to upload files to third-party servers</li>
			<li>Teams working behind firewalls where external uploads are blocked</li>
		</ul>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Frequently asked questions
		</h3>
		<dl class="space-y-3">
			<div>
				<dt class="font-medium text-neutral-700 dark:text-neutral-300">Are the PDF tools really free?</dt>
				<dd class="mt-0.5">Yes. Every tool is completely free with no usage limits, no sign-up, and no hidden fees. All processing runs in your browser — there are no servers to pay for.</dd>
			</div>
			<div>
				<dt class="font-medium text-neutral-700 dark:text-neutral-300">Do my files get uploaded to a server?</dt>
				<dd class="mt-0.5">No. HTMLtoPDF.pro runs 100% in your browser. Your files never leave your device. The tools use client-side JavaScript libraries (pdf-lib, PDF.js) that process everything locally.</dd>
			</div>
			<div>
				<dt class="font-medium text-neutral-700 dark:text-neutral-300">What PDF tools are available?</dt>
				<dd class="mt-0.5">14 free tools: Merge PDF, Compress PDF, JPG to PDF, PDF to JPG, Split PDF, Rotate PDF, Add Page Numbers, Watermark PDF, PDF to PNG, PNG to PDF, Protect PDF, Unlock PDF, Reorder Pages, and HTML to PDF.</dd>
			</div>
			<div>
				<dt class="font-medium text-neutral-700 dark:text-neutral-300">Is there a file size limit?</dt>
				<dd class="mt-0.5">No artificial limit. Since all processing happens in your browser, the only limit is your device memory. Modern browsers can handle files of several hundred megabytes.</dd>
			</div>
			<div>
				<dt class="font-medium text-neutral-700 dark:text-neutral-300">Does it work offline?</dt>
				<dd class="mt-0.5">After the page loads, all PDF tools work without an internet connection. The JavaScript libraries are bundled with the page — no server communication is needed during processing.</dd>
			</div>
		</dl>
	</div>
</article>
