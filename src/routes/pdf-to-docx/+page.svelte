<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('pdf-to-docx')!;

	let file = $state<File | null>(null);
	let isConverting = $state(false);
	let error = $state('');
	let pageCount = $state(0);

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
			pageCount = 0;
		}
	}

	async function convert() {
		if (!file || isConverting) return;
		isConverting = true;
		error = '';

		try {
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = '';

			const bytes = await file.arrayBuffer();
			const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
			pageCount = pdfDoc.numPages;

			// Extract text from all pages with structure
			const pageTexts: string[][] = [];

			for (let i = 1; i <= pdfDoc.numPages; i++) {
				const page = await pdfDoc.getPage(i);
				const content = await page.getTextContent();

				// Group text items into lines by Y position
				const lines = new Map<number, { x: number; text: string }[]>();

				for (const item of content.items) {
					if (!('str' in item) || !item.str.trim()) continue;
					// Round Y to group items on same line (PDFs have slight Y variations)
					const y = Math.round(item.transform[5]);
					const x = item.transform[4];
					if (!lines.has(y)) lines.set(y, []);
					lines.get(y)!.push({ x, text: item.str });
				}

				// Sort lines top to bottom (highest Y first in PDF coords)
				const sortedYs = Array.from(lines.keys()).sort((a, b) => b - a);
				const paragraphs: string[] = [];

				for (const y of sortedYs) {
					const items = lines.get(y)!.sort((a, b) => a.x - b.x);
					const lineText = items.map((i) => i.text).join(' ').trim();
					if (lineText) paragraphs.push(lineText);
				}

				pageTexts.push(paragraphs);
			}

			// Build DOCX
			const { Document, Paragraph, TextRun, Packer, PageBreak, HeadingLevel } = await import(
				'docx'
			);

			const sections: { children: InstanceType<typeof Paragraph>[] }[] = [];

			for (let i = 0; i < pageTexts.length; i++) {
				const children: InstanceType<typeof Paragraph>[] = [];

				// Add page header
				if (pdfDoc.numPages > 1) {
					children.push(
						new Paragraph({
							heading: HeadingLevel.HEADING_2,
							children: [new TextRun({ text: `Page ${i + 1}`, bold: true })]
						})
					);
				}

				for (const line of pageTexts[i]) {
					// Heuristic: lines that are short and all-caps or start with number might be headings
					const isHeading =
						line.length < 80 &&
						(line === line.toUpperCase() ||
							/^\d+\.\s/.test(line)) &&
						line.length > 2;

					children.push(
						new Paragraph({
							heading: isHeading ? HeadingLevel.HEADING_3 : undefined,
							children: [
								new TextRun({
									text: line,
									bold: isHeading
								})
							]
						})
					);
				}

				// Add page break between pages (except last)
				if (i < pageTexts.length - 1 && children.length > 0) {
					children.push(
						new Paragraph({
							children: [new TextRun({ break: 1 }), new TextRun({ text: '' })]
						})
					);
				}

				sections.push({ children });
			}

			// Flatten all into one section for cleaner output
			const allChildren = sections.flatMap((s) => s.children);

			const doc = new Document({
				sections: [{ children: allChildren }]
			});

			const blob = await Packer.toBlob(doc);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name.replace(/\.pdf$/i, '.docx');
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
		<FileDropZone accept=".pdf" multiple={false} label="Drop a PDF file here or click to browse" onfiles={handleFiles} />

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
						pageCount = 0;
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
					Converting{pageCount > 0 ? ` (${pageCount} pages)` : ''}...
				</span>
			{:else}
				Convert to DOCX
			{/if}
		</button>

		<p class="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
			Extracts text content from PDF. Best for text-based PDFs.
		</p>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF to Word converter — no upload required
		</h2>
		<p class="mb-3">
			Convert PDF files to editable Word documents (.docx) entirely in your browser. The PDF is
			parsed using PDF.js to extract text content from each page, then the text is structured
			into paragraphs and assembled into a .docx file. Your files never leave your device.
		</p>
		<p class="mb-3">
			This tool works best with text-based PDFs (documents created from Word, Google Docs, etc.).
			Scanned PDFs that contain only images require OCR, which is not yet supported. Complex
			layouts with columns, tables, and embedded graphics may not preserve their exact visual
			arrangement, but the text content is fully extracted.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to convert PDF to Word</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Drop your PDF file or click to browse</li>
			<li>Click "Convert to DOCX"</li>
			<li>Text is extracted from each page and assembled into a Word document</li>
			<li>The .docx file downloads automatically</li>
		</ol>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">What works best</h3>
		<ul class="mb-3 list-disc space-y-1 pl-5">
			<li>Text-heavy PDFs (reports, articles, documentation)</li>
			<li>PDFs created from Word, Google Docs, or other text editors</li>
			<li>Single-column layouts with standard paragraph structure</li>
		</ul>
	{/snippet}
</ToolPageLayout>
