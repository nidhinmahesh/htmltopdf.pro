<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('compress-pdf')!;

	let file = $state<File | null>(null);
	let isCompressing = $state(false);
	let error = $state('');
	let result = $state<{ originalSize: number; compressedSize: number } | null>(null);
	let quality = $state(0.7);

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			result = null;
			error = '';
		}
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function compress() {
		if (!file || isCompressing) return;
		isCompressing = true;
		error = '';
		result = null;

		try {
			const { PDFDocument } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const originalSize = bytes.byteLength;

			const srcDoc = await PDFDocument.load(bytes);
			const doc = await PDFDocument.create();
			const pages = await doc.copyPages(srcDoc, srcDoc.getPageIndices());
			pages.forEach((page) => doc.addPage(page));

			// Re-render each page via canvas to compress images
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = '';

			const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
			const pdfDoc = await loadingTask.promise;

			const compressedDoc = await PDFDocument.create();

			for (let i = 1; i <= pdfDoc.numPages; i++) {
				const pdfPage = await pdfDoc.getPage(i);
				const viewport = pdfPage.getViewport({ scale: 1.5 });

				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d')!;

				await pdfPage.render({ canvasContext: ctx, viewport }).promise;

				const blob = await new Promise<Blob>((r) =>
					canvas.toBlob((b) => r(b!), 'image/jpeg', quality)
				);
				const imgBytes = new Uint8Array(await blob.arrayBuffer());
				const image = await compressedDoc.embedJpg(imgBytes);

				const page = compressedDoc.addPage([viewport.width, viewport.height]);
				page.drawImage(image, {
					x: 0,
					y: 0,
					width: viewport.width,
					height: viewport.height
				});
			}

			const compressedBytes = await compressedDoc.save();
			const compressedSize = compressedBytes.byteLength;

			result = { originalSize, compressedSize };

			const blob = new Blob([compressedBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `compressed-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
			trackConversion('compress-pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compression failed';
		} finally {
			isCompressing = false;
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
					<p class="text-xs text-neutral-400 dark:text-neutral-500">{formatSize(file.size)}</p>
				</div>
				<button
					onclick={() => {
						file = null;
						result = null;
					}}
					class="text-neutral-400 transition-colors hover:text-red-500"
					aria-label="Remove"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="mt-4">
				<label class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
					<span>Quality: {Math.round(quality * 100)}%</span>
					<span class="text-xs text-neutral-400">
						{quality > 0.8 ? 'High quality, less compression' : quality > 0.5 ? 'Balanced' : 'Max compression'}
					</span>
				</label>
				<input
					type="range"
					bind:value={quality}
					min="0.3"
					max="0.95"
					step="0.05"
					class="mt-1 w-full accent-neutral-900 dark:accent-neutral-100"
				/>
			</div>
		{/if}

		{#if result}
			<div
				class="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3
						dark:border-green-900 dark:bg-green-950"
			>
				<p class="text-sm text-green-700 dark:text-green-300">
					Compressed: {formatSize(result.originalSize)} → {formatSize(result.compressedSize)}
					({Math.round((1 - result.compressedSize / result.originalSize) * 100)}% smaller)
				</p>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={compress}
			disabled={!file || isCompressing}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors
					hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900
					dark:hover:bg-neutral-200"
		>
			{#if isCompressing}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Compressing...
				</span>
			{:else}
				Compress PDF
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF compressor — reduce file size without uploading
		</h2>
		<p class="mb-3">
			Compress PDF files entirely in your browser by re-rendering pages as optimized images. Adjust
			the quality slider to balance between file size and visual quality. Your files never leave
			your device.
		</p>
		<p class="mb-3">
			This is the only PDF compressor that processes your files 100% client-side. Other tools
			upload your documents to remote servers — HTMLtoPDF.pro keeps everything private.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How compression works</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Each PDF page is rendered to a canvas using PDF.js</li>
			<li>The canvas is re-encoded as a JPEG at your chosen quality level</li>
			<li>Images are embedded into a new, smaller PDF document</li>
			<li>The compressed PDF downloads automatically</li>
		</ol>
	{/snippet}
</ToolPageLayout>
