<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('merge-pdf')!;

	let files = $state<{ file: File; name: string }[]>([]);
	let isMerging = $state(false);
	let error = $state('');

	function handleFiles(newFiles: File[]) {
		const pdfs = newFiles.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		files = [...files, ...pdfs.map((f) => ({ file: f, name: f.name }))];
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}

	function moveFile(from: number, to: number) {
		if (to < 0 || to >= files.length) return;
		const updated = [...files];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		files = updated;
	}

	async function merge() {
		if (files.length < 2 || isMerging) return;
		isMerging = true;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const merged = await PDFDocument.create();

			for (const { file } of files) {
				const bytes = await file.arrayBuffer();
				const doc = await PDFDocument.load(bytes);
				const pages = await merged.copyPages(doc, doc.getPageIndices());
				pages.forEach((page) => merged.addPage(page));
			}

			const pdfBytes = await merged.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'merged.pdf';
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Merge failed';
		} finally {
			isMerging = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone accept=".pdf" label="Drop PDF files here or click to browse" onfiles={handleFiles} />

		{#if files.length > 0}
			<div class="mt-4 space-y-2">
				{#each files as f, i}
					<div
						class="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2.5
								dark:border-neutral-800 dark:bg-neutral-900"
					>
						<div class="flex items-center gap-3">
							<span
								class="flex h-6 w-6 items-center justify-center rounded bg-neutral-100 text-xs font-medium text-neutral-500
										dark:bg-neutral-800 dark:text-neutral-400"
							>
								{i + 1}
							</span>
							<span class="text-sm text-neutral-700 dark:text-neutral-300">{f.name}</span>
						</div>
						<div class="flex items-center gap-1">
							<button
								onclick={() => moveFile(i, i - 1)}
								disabled={i === 0}
								class="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-30
										dark:hover:text-neutral-300"
								aria-label="Move up"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
								</svg>
							</button>
							<button
								onclick={() => moveFile(i, i + 1)}
								disabled={i === files.length - 1}
								class="rounded p-1 text-neutral-400 transition-colors hover:text-neutral-600 disabled:opacity-30
										dark:hover:text-neutral-300"
								aria-label="Move down"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</button>
							<button
								onclick={() => removeFile(i)}
								class="ml-1 rounded p-1 text-neutral-400 transition-colors hover:text-red-500 dark:hover:text-red-400"
								aria-label="Remove file"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={merge}
			disabled={files.length < 2 || isMerging}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors
					hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900
					dark:hover:bg-neutral-200"
		>
			{#if isMerging}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Merging...
				</span>
			{:else}
				Merge {files.length} PDF{files.length !== 1 ? 's' : ''}
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF merger — combine PDFs without uploading
		</h2>
		<p class="mb-3">
			Merge multiple PDF files into a single document entirely in your browser. Drag and drop your
			PDFs, reorder them as needed, and combine them with one click. Your files never leave your
			device — the entire process runs locally using pdf-lib.
		</p>
		<p class="mb-3">
			Unlike other PDF mergers that upload your files to remote servers, HTMLtoPDF.pro processes
			everything client-side. This means faster processing, complete privacy, and no file size
			limits beyond your browser's memory.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to merge PDFs</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Drop your PDF files into the upload area or click to browse</li>
			<li>Reorder files using the up/down arrows</li>
			<li>Click "Merge" to combine them into one PDF</li>
			<li>The merged PDF downloads automatically</li>
		</ol>
	{/snippet}
</ToolPageLayout>
