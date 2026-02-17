<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

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

	interface TextLine {
		text: string;
		fontSize: number;
		isBold: boolean;
		isItalic: boolean;
		x: number;
		y: number;
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

			// Extract structured text from all pages
			const allPageLines: TextLine[][] = [];

			for (let p = 1; p <= pdfDoc.numPages; p++) {
				const page = await pdfDoc.getPage(p);
				const content = await page.getTextContent();

				// Group text items into lines by Y position (rounded to 2px tolerance)
				const lineMap = new Map<number, { x: number; text: string; fontSize: number; fontName: string }[]>();

				for (const item of content.items) {
					if (!('str' in item) || !item.str) continue;

					const fontSize = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || 12;
					const x = item.transform[4];
					const rawY = item.transform[5];
					// Round Y to 2px buckets to merge items on same visual line
					const y = Math.round(rawY / 2) * 2;
					const fontName = (item as any).fontName || '';

					if (!lineMap.has(y)) lineMap.set(y, []);
					lineMap.get(y)!.push({ x, text: item.str, fontSize, fontName });
				}

				// Sort lines top-to-bottom (highest Y first in PDF coordinate space)
				const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
				const lines: TextLine[] = [];

				for (const y of sortedYs) {
					const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
					const lineText = items.map((i) => i.text).join('').trim();
					if (!lineText) continue;

					// Use the dominant font size on this line
					const avgFontSize = items.reduce((sum, i) => sum + i.fontSize, 0) / items.length;
					// Detect bold/italic from font name
					const fontNames = items.map((i) => i.fontName.toLowerCase()).join(' ');
					const isBold = fontNames.includes('bold') || fontNames.includes('black');
					const isItalic = fontNames.includes('italic') || fontNames.includes('oblique');

					lines.push({
						text: lineText,
						fontSize: Math.round(avgFontSize * 10) / 10,
						isBold,
						isItalic,
						x: items[0].x,
						y
					});
				}

				allPageLines.push(lines);
			}

			// Determine the most common font size across all pages (= body text size)
			const allFontSizes = allPageLines.flat().map((l) => l.fontSize);
			const sizeFreq = new Map<number, number>();
			for (const s of allFontSizes) {
				const rounded = Math.round(s);
				sizeFreq.set(rounded, (sizeFreq.get(rounded) || 0) + 1);
			}
			let bodyFontSize = 12;
			let maxFreq = 0;
			for (const [size, freq] of sizeFreq) {
				if (freq > maxFreq) {
					maxFreq = freq;
					bodyFontSize = size;
				}
			}

			// Build DOCX with proper structure
			const { Document, Paragraph, TextRun, Packer, HeadingLevel, PageBreak, AlignmentType } =
				await import('docx');

			const docChildren: InstanceType<typeof Paragraph>[] = [];

			for (let p = 0; p < allPageLines.length; p++) {
				const lines = allPageLines[p];

				// Merge adjacent lines that belong to the same paragraph:
				// Same font size, similar x position, and small Y gap
				const merged: { text: string; fontSize: number; isBold: boolean; isItalic: boolean; x: number }[] = [];

				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					const prev = merged.length > 0 ? merged[merged.length - 1] : null;

					// Merge into previous if: same font size, similar indent, and not a heading-sized line
					const sameFontSize = prev && Math.abs(prev.fontSize - line.fontSize) < 1.5;
					const similarIndent = prev && Math.abs(prev.x - line.x) < 20;
					const isBodySize = Math.abs(line.fontSize - bodyFontSize) < 1.5;

					if (prev && sameFontSize && similarIndent && isBodySize && !line.isBold) {
						// Append to previous paragraph with a space
						prev.text += ' ' + line.text;
					} else {
						merged.push({ ...line });
					}
				}

				for (const block of merged) {
					const isLarger = block.fontSize > bodyFontSize + 3;
					const isSlightlyLarger = block.fontSize > bodyFontSize + 1.5;

					let heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
					if (isLarger && block.fontSize > bodyFontSize + 6) {
						heading = HeadingLevel.HEADING_1;
					} else if (isLarger) {
						heading = HeadingLevel.HEADING_2;
					} else if (isSlightlyLarger || (block.isBold && block.text.length < 100)) {
						heading = HeadingLevel.HEADING_3;
					}

					docChildren.push(
						new Paragraph({
							heading,
							children: [
								new TextRun({
									text: block.text,
									bold: block.isBold || !!heading,
									italics: block.isItalic,
									size: heading ? undefined : 24 // 12pt in half-points
								})
							]
						})
					);
				}

				// Page break between pages (except last)
				if (p < allPageLines.length - 1) {
					docChildren.push(
						new Paragraph({
							children: [new TextRun({ break: 1 })]
						})
					);
				}
			}

			if (docChildren.length === 0) {
				throw new Error('No text content found in the PDF. The document may be image-based (scanned).');
			}

			const doc = new Document({
				sections: [
					{
						properties: {
							page: {
								margin: {
									top: 1440,    // 1 inch in twips
									bottom: 1440,
									left: 1440,
									right: 1440
								}
							}
						},
						children: docChildren
					}
				]
			});

			const blob = await Packer.toBlob(doc);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = file.name.replace(/\.pdf$/i, '.docx');
			a.click();
			URL.revokeObjectURL(url);
			trackConversion('pdf-to-docx');
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
