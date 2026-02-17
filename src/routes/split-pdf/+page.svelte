<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('split-pdf')!;

	let file = $state<File | null>(null);
	let totalPages = $state(0);
	let pageRange = $state('');
	let splitMode = $state<'range' | 'individual'>('range');
	let isSplitting = $state(false);
	let error = $state('');

	async function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (!pdf) return;

		file = pdf;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const bytes = await pdf.arrayBuffer();
			const doc = await PDFDocument.load(bytes);
			totalPages = doc.getPageCount();
			pageRange = `1-${totalPages}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to read PDF';
		}
	}

	function parseRange(range: string, max: number): number[] {
		const pages = new Set<number>();
		const parts = range.split(',').map((s) => s.trim());

		for (const part of parts) {
			if (part.includes('-')) {
				const [startStr, endStr] = part.split('-');
				const start = Math.max(1, parseInt(startStr));
				const end = Math.min(max, parseInt(endStr));
				if (!isNaN(start) && !isNaN(end)) {
					for (let i = start; i <= end; i++) pages.add(i);
				}
			} else {
				const num = parseInt(part);
				if (!isNaN(num) && num >= 1 && num <= max) pages.add(num);
			}
		}

		return Array.from(pages).sort((a, b) => a - b);
	}

	async function split() {
		if (!file || isSplitting) return;
		isSplitting = true;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const srcDoc = await PDFDocument.load(bytes);

			if (splitMode === 'individual') {
				for (let i = 0; i < srcDoc.getPageCount(); i++) {
					const newDoc = await PDFDocument.create();
					const [page] = await newDoc.copyPages(srcDoc, [i]);
					newDoc.addPage(page);

					const pdfBytes = await newDoc.save();
					const blob = new Blob([pdfBytes], { type: 'application/pdf' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = `page-${i + 1}.pdf`;
					a.click();
					URL.revokeObjectURL(url);
					await new Promise((r) => setTimeout(r, 200));
				}
				trackConversion('split-pdf');
			} else {
				const pageNums = parseRange(pageRange, totalPages);
				if (pageNums.length === 0) {
					error = 'No valid pages selected';
					return;
				}

				const newDoc = await PDFDocument.create();
				const indices = pageNums.map((n) => n - 1);
				const pages = await newDoc.copyPages(srcDoc, indices);
				pages.forEach((page) => newDoc.addPage(page));

				const pdfBytes = await newDoc.save();
				const blob = new Blob([pdfBytes], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `split-${file.name}`;
				a.click();
				URL.revokeObjectURL(url);
				trackConversion('split-pdf');
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Split failed';
		} finally {
			isSplitting = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone accept=".pdf" multiple={false} label="Drop a PDF file here or click to browse" onfiles={handleFiles} />

		{#if file && totalPages > 0}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3
						dark:border-neutral-800 dark:bg-neutral-900"
			>
				<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
					{file.name}
					<span class="text-neutral-400 dark:text-neutral-500">— {totalPages} pages</span>
				</p>
			</div>

			<div class="mt-4 flex gap-2">
				<button
					onclick={() => (splitMode = 'range')}
					class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors
							{splitMode === 'range'
						? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
				>
					Extract range
				</button>
				<button
					onclick={() => (splitMode = 'individual')}
					class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors
							{splitMode === 'individual'
						? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
						: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
				>
					Split all pages
				</button>
			</div>

			{#if splitMode === 'range'}
				<div class="mt-3">
					<label class="text-sm text-neutral-600 dark:text-neutral-400">
						Pages to extract (e.g., 1-3, 5, 8-10)
					</label>
					<input
						bind:value={pageRange}
						type="text"
						class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
								focus:border-neutral-400 focus:outline-none
								dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
						placeholder="1-{totalPages}"
					/>
				</div>
			{:else}
				<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
					Each page will be downloaded as a separate PDF file.
				</p>
			{/if}
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={split}
			disabled={!file || isSplitting}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors
					hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900
					dark:hover:bg-neutral-200"
		>
			{#if isSplitting}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Splitting...
				</span>
			{:else}
				{splitMode === 'individual' ? 'Split into individual pages' : 'Extract selected pages'}
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF splitter — extract pages without uploading
		</h2>
		<p class="mb-3">
			Split PDF files or extract specific pages entirely in your browser. Choose to extract a
			range of pages into a new PDF, or split every page into individual files. Your files never
			leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to split a PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Choose "Extract range" or "Split all pages"</li>
			<li>For range mode, enter page numbers (e.g., 1-3, 5, 8-10)</li>
			<li>Click the button and your extracted PDF downloads</li>
		</ol>
	{/snippet}
</ToolPageLayout>
