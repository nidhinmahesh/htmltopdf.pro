<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('pdf-to-jpg')!;

	let file = $state<File | null>(null);
	let isConverting = $state(false);
	let error = $state('');
	let pages = $state<{ url: string; index: number }[]>([]);
	let scale = $state(2);

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			pages = [];
			error = '';
		}
	}

	async function convert() {
		if (!file || isConverting) return;
		isConverting = true;
		error = '';
		pages = [];

		try {
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = '';

			const bytes = await file.arrayBuffer();
			const pdfDoc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;

			const rendered: { url: string; index: number }[] = [];

			for (let i = 1; i <= pdfDoc.numPages; i++) {
				const page = await pdfDoc.getPage(i);
				const viewport = page.getViewport({ scale });

				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d')!;

				await page.render({ canvasContext: ctx, viewport }).promise;

				const blob = await new Promise<Blob>((r) =>
					canvas.toBlob((b) => r(b!), 'image/jpeg', 0.92)
				);
				const url = URL.createObjectURL(blob);
				rendered.push({ url, index: i });
			}

			pages = rendered;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			isConverting = false;
		}
	}

	function downloadPage(page: { url: string; index: number }) {
		const a = document.createElement('a');
		a.href = page.url;
		a.download = `page-${page.index}.jpg`;
		a.click();
	}

	async function downloadAll() {
		for (const page of pages) {
			downloadPage(page);
			await new Promise((r) => setTimeout(r, 200));
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone accept=".pdf" multiple={false} label="Drop a PDF file here or click to browse" onfiles={handleFiles} />

		{#if file && pages.length === 0}
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
			</div>

			<div class="mt-4">
				<label class="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
					<span>Resolution: {scale}x</span>
					<span class="text-xs text-neutral-400">
						{scale >= 3 ? 'High resolution' : scale >= 2 ? 'Standard' : 'Fast, lower quality'}
					</span>
				</label>
				<input
					type="range"
					bind:value={scale}
					min="1"
					max="4"
					step="0.5"
					class="mt-1 w-full accent-neutral-900 dark:accent-neutral-100"
				/>
			</div>
		{/if}

		{#if pages.length > 0}
			<div class="mt-4 flex items-center justify-between">
				<p class="text-sm text-neutral-600 dark:text-neutral-400">
					{pages.length} page{pages.length !== 1 ? 's' : ''} converted
				</p>
				<button
					onclick={downloadAll}
					class="text-sm font-medium text-neutral-700 underline underline-offset-2 transition-colors
							hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
				>
					Download all
				</button>
			</div>

			<div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#each pages as page}
					<button
						onclick={() => downloadPage(page)}
						class="group cursor-pointer overflow-hidden rounded-lg border border-neutral-200 transition-all
								hover:border-neutral-300 hover:shadow-sm
								dark:border-neutral-800 dark:hover:border-neutral-700"
					>
						<img
							src={page.url}
							alt="Page {page.index}"
							class="aspect-[3/4] w-full object-cover"
						/>
						<p class="px-2 py-1.5 text-xs text-neutral-500 group-hover:text-neutral-700
								dark:text-neutral-400 dark:group-hover:text-neutral-300">
							Page {page.index} — click to download
						</p>
					</button>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		{#if pages.length === 0}
			<button
				onclick={convert}
				disabled={!file || isConverting}
				class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
						text-white transition-colors
						hover:bg-neutral-800
						disabled:cursor-not-allowed disabled:opacity-40
						dark:bg-neutral-100 dark:text-neutral-900
						dark:hover:bg-neutral-200"
			>
				{#if isConverting}
					<span class="inline-flex items-center gap-2">
						<span class="spinner"></span>
						Converting...
					</span>
				{:else}
					Convert to JPG
				{/if}
			</button>
		{/if}
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF to JPG converter — no upload required
		</h2>
		<p class="mb-3">
			Convert PDF pages to high-quality JPG images entirely in your browser. Each page is rendered
			at your chosen resolution using PDF.js (Mozilla's client-side PDF renderer). Your files
			never leave your device.
		</p>
		<p class="mb-3">
			Adjust the resolution slider to control output quality. Higher resolution produces sharper
			images but takes longer to process. Download individual pages or all at once.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How it works</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Choose your desired resolution</li>
			<li>Click "Convert to JPG" — each page renders as an image</li>
			<li>Download individual pages or all at once</li>
		</ol>
	{/snippet}
</ToolPageLayout>
