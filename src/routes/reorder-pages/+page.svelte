<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('reorder-pages')!;

	let file = $state<File | null>(null);
	let pageOrder = $state<number[]>([]);
	let thumbnails = $state<string[]>([]);
	let isLoading = $state(false);
	let isSaving = $state(false);
	let error = $state('');
	let dragIndex = $state<number | null>(null);

	async function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (!pdf) return;

		file = pdf;
		isLoading = true;
		error = '';
		thumbnails = [];
		pageOrder = [];

		try {
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = '';

			const bytes = await pdf.arrayBuffer();
			const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;

			const thumbs: string[] = [];
			for (let i = 1; i <= doc.numPages; i++) {
				const page = await doc.getPage(i);
				const viewport = page.getViewport({ scale: 0.5 });

				const canvas = document.createElement('canvas');
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const ctx = canvas.getContext('2d')!;

				await page.render({ canvasContext: ctx, viewport }).promise;
				thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
			}

			thumbnails = thumbs;
			pageOrder = thumbs.map((_, i) => i);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			isLoading = false;
		}
	}

	function movePage(from: number, to: number) {
		if (to < 0 || to >= pageOrder.length) return;
		const updated = [...pageOrder];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		pageOrder = updated;
	}

	async function save() {
		if (!file || isSaving) return;
		isSaving = true;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const srcDoc = await PDFDocument.load(bytes);

			const newDoc = await PDFDocument.create();
			const pages = await newDoc.copyPages(srcDoc, pageOrder);
			pages.forEach((page) => newDoc.addPage(page));

			const pdfBytes = await newDoc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `reordered-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to save PDF';
		} finally {
			isSaving = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		{#if !file}
			<FileDropZone accept=".pdf" multiple={false} label="Drop a PDF file here or click to browse" onfiles={handleFiles} />
		{/if}

		{#if isLoading}
			<div class="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
				<span class="spinner"></span>
				Loading pages...
			</div>
		{/if}

		{#if thumbnails.length > 0}
			<div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
				{#each pageOrder as pageIdx, i}
					<div
						class="group relative overflow-hidden rounded-lg border-2 transition-all
								{dragIndex === i
							? 'border-blue-400 dark:border-blue-500'
							: 'border-neutral-200 dark:border-neutral-800'}"
						draggable="true"
						role="listitem"
						ondragstart={() => (dragIndex = i)}
						ondragover={(e) => e.preventDefault()}
						ondrop={() => {
							if (dragIndex !== null && dragIndex !== i) {
								movePage(dragIndex, i);
							}
							dragIndex = null;
						}}
						ondragend={() => (dragIndex = null)}
					>
						<img
							src={thumbnails[pageIdx]}
							alt="Page {pageIdx + 1}"
							class="aspect-[3/4] w-full object-cover"
						/>
						<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
							<span class="text-xs font-medium text-white">Page {pageIdx + 1}</span>
						</div>
						<div
							class="absolute right-1 top-1 flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<button
								onclick={() => movePage(i, i - 1)}
								disabled={i === 0}
								class="rounded bg-white/90 p-0.5 text-neutral-700 disabled:opacity-30"
								aria-label="Move left"
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button
								onclick={() => movePage(i, i + 1)}
								disabled={i === pageOrder.length - 1}
								class="rounded bg-white/90 p-0.5 text-neutral-700 disabled:opacity-30"
								aria-label="Move right"
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>

			<p class="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
				Drag pages to reorder or use arrow buttons
			</p>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		{#if thumbnails.length > 0}
			<button
				onclick={save}
				disabled={isSaving}
				class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
						text-white transition-colors hover:bg-neutral-800
						disabled:cursor-not-allowed disabled:opacity-40
						dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
			>
				{#if isSaving}
					<span class="inline-flex items-center gap-2">
						<span class="spinner"></span>
						Saving...
					</span>
				{:else}
					Save Reordered PDF
				{/if}
			</button>
		{/if}
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF page reordering — drag and drop without uploading
		</h2>
		<p class="mb-3">
			Rearrange PDF pages with visual drag-and-drop, entirely in your browser. See thumbnails of
			each page, drag them into the order you want, and save the reordered PDF. Your files never
			leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to reorder pages</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Drag page thumbnails to rearrange them</li>
			<li>Click "Save Reordered PDF" to download the result</li>
		</ol>
	{/snippet}
</ToolPageLayout>
