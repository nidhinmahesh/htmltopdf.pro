<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('docx-to-pdf')!;

	let file = $state<File | null>(null);
	let isConverting = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const docx = files.find(
			(f) =>
				f.name.endsWith('.docx') ||
				f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		);
		if (docx) {
			file = docx;
			error = '';
		}
	}

	async function convert() {
		if (!file || isConverting) return;
		isConverting = true;
		error = '';

		try {
			const mammoth = await import('mammoth');
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.default.convertToHtml({ arrayBuffer });

			if (!result.value.trim()) {
				throw new Error('No content found in the document');
			}

			// Wrap in a styled HTML document for proper rendering
			const html = `<!DOCTYPE html>
<html>
<head>
<style>
	body {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		line-height: 1.6;
		max-width: 700px;
		margin: 40px auto;
		padding: 0 20px;
		color: #222;
		font-size: 14px;
	}
	h1 { font-size: 24px; margin: 24px 0 12px; font-weight: 700; }
	h2 { font-size: 20px; margin: 20px 0 10px; font-weight: 600; }
	h3 { font-size: 16px; margin: 16px 0 8px; font-weight: 600; }
	p { margin: 0 0 10px; }
	ul, ol { margin: 0 0 10px; padding-left: 24px; }
	li { margin: 2px 0; }
	table { border-collapse: collapse; width: 100%; margin: 12px 0; }
	th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; font-size: 13px; }
	th { background: #f5f5f5; font-weight: 600; }
	img { max-width: 100%; height: auto; }
	strong { font-weight: 600; }
	em { font-style: italic; }
</style>
</head>
<body>${result.value}</body>
</html>`;

			// Use our existing HTML-to-PDF converter
			const { convertHtmlToPdf } = await import('$lib/engine/converter');
			const blob = await convertHtmlToPdf(html);

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name.replace(/\.docx$/i, '.pdf');
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			isConverting = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone
			accept=".docx"
			multiple={false}
			label="Drop a Word document here or click to browse"
			onfiles={handleFiles}
		/>

		{#if file}
			<div
				class="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3
						dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div>
					<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{file.name}</p>
					<p class="text-xs text-neutral-400 dark:text-neutral-500">
						{(file.size / 1024).toFixed(1)} KB
					</p>
				</div>
				<button
					onclick={() => {
						file = null;
						error = '';
					}}
					class="text-neutral-400 transition-colors hover:text-red-500"
					aria-label="Remove"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={convert}
			disabled={!file || isConverting}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
		>
			{#if isConverting}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Converting...
				</span>
			{:else}
				Convert to PDF
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free DOCX to PDF converter — no upload required
		</h2>
		<p class="mb-3">
			Convert Microsoft Word documents (.docx) to PDF entirely in your browser. The document is
			parsed client-side using mammoth.js, which extracts headings, paragraphs, lists, tables,
			bold, italic, and embedded images. The content is then rendered as a styled HTML page and
			captured as a clean PDF. Your files never leave your device.
		</p>
		<p class="mb-3">
			Unlike online Word-to-PDF converters that upload your documents to remote servers,
			HTMLtoPDF.pro processes everything locally. This makes it ideal for sensitive documents like
			contracts, resumes, reports, and legal papers.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to convert Word to PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Drop your .docx file or click to browse</li>
			<li>Click "Convert to PDF"</li>
			<li>The PDF downloads automatically — nothing is uploaded</li>
		</ol>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">Supported formatting</h3>
		<ul class="mb-3 list-disc space-y-1 pl-5">
			<li>Headings (H1–H6), paragraphs, line breaks</li>
			<li>Bold, italic, underline, strikethrough</li>
			<li>Ordered and unordered lists</li>
			<li>Tables with headers</li>
			<li>Embedded images</li>
			<li>Hyperlinks</li>
		</ul>
	{/snippet}
</ToolPageLayout>
