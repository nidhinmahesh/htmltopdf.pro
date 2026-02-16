<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('watermark-pdf')!;

	let file = $state<File | null>(null);
	let watermarkText = $state('CONFIDENTIAL');
	let opacity = $state(0.15);
	let fontSize = $state(60);
	let isProcessing = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
		}
	}

	async function addWatermark() {
		if (!file || !watermarkText.trim() || isProcessing) return;
		isProcessing = true;
		error = '';

		try {
			const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes);
			const font = await doc.embedFont(StandardFonts.Helvetica);

			doc.getPages().forEach((page) => {
				const { width, height } = page.getSize();
				const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
				const textHeight = font.heightAtSize(fontSize);

				page.drawText(watermarkText, {
					x: (width - textWidth) / 2,
					y: (height - textHeight) / 2,
					size: fontSize,
					font,
					color: rgb(0.5, 0.5, 0.5),
					opacity,
					rotate: degrees(-45)
				});
			});

			const pdfBytes = await doc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `watermarked-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add watermark';
		} finally {
			isProcessing = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone accept=".pdf" multiple={false} label="Drop a PDF file here or click to browse" onfiles={handleFiles} />

		{#if file}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3
						dark:border-neutral-800 dark:bg-neutral-900"
			>
				<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{file.name}</p>
			</div>

			<div class="mt-4 space-y-3">
				<div>
					<label class="text-sm text-neutral-600 dark:text-neutral-400">Watermark text</label>
					<input
						bind:value={watermarkText}
						type="text"
						class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
								focus:border-neutral-400 focus:outline-none
								dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
						placeholder="Enter watermark text"
					/>
				</div>

				<div>
					<label class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
						<span>Opacity: {Math.round(opacity * 100)}%</span>
					</label>
					<input
						type="range"
						bind:value={opacity}
						min="0.05"
						max="0.5"
						step="0.05"
						class="mt-1 w-full accent-neutral-900 dark:accent-neutral-100"
					/>
				</div>

				<div>
					<label class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
						<span>Font size: {fontSize}px</span>
					</label>
					<input
						type="range"
						bind:value={fontSize}
						min="20"
						max="120"
						step="5"
						class="mt-1 w-full accent-neutral-900 dark:accent-neutral-100"
					/>
				</div>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={addWatermark}
			disabled={!file || !watermarkText.trim() || isProcessing}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
		>
			{#if isProcessing}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Adding watermark...
				</span>
			{:else}
				Add Watermark
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF watermark tool — stamp text without uploading
		</h2>
		<p class="mb-3">
			Add a text watermark to every page of your PDF entirely in your browser. Customize the text,
			opacity, and font size. The watermark is placed diagonally across each page. Your files
			never leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to watermark a PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Enter your watermark text</li>
			<li>Adjust opacity and font size</li>
			<li>Click "Add Watermark" and download the result</li>
		</ol>
	{/snippet}
</ToolPageLayout>
