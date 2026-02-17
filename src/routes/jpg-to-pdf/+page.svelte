<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('jpg-to-pdf')!;

	let files = $state<{ file: File; name: string; preview: string }[]>([]);
	let isConverting = $state(false);
	let error = $state('');

	function handleFiles(newFiles: File[]) {
		const images = newFiles.filter((f) => f.type.startsWith('image/'));
		for (const file of images) {
			const preview = URL.createObjectURL(file);
			files = [...files, { file, name: file.name, preview }];
		}
	}

	function removeFile(index: number) {
		URL.revokeObjectURL(files[index].preview);
		files = files.filter((_, i) => i !== index);
	}

	function moveFile(from: number, to: number) {
		if (to < 0 || to >= files.length) return;
		const updated = [...files];
		const [item] = updated.splice(from, 1);
		updated.splice(to, 0, item);
		files = updated;
	}

	async function convert() {
		if (files.length === 0 || isConverting) return;
		isConverting = true;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const pdf = await PDFDocument.create();

			for (const { file } of files) {
				const bytes = await file.arrayBuffer();
				const uint8 = new Uint8Array(bytes);

				let image;
				if (file.type === 'image/png') {
					image = await pdf.embedPng(uint8);
				} else {
					// Convert non-JPG/PNG to JPG via canvas
					if (file.type !== 'image/jpeg') {
						const bitmap = await createImageBitmap(file);
						const canvas = document.createElement('canvas');
						canvas.width = bitmap.width;
						canvas.height = bitmap.height;
						const ctx = canvas.getContext('2d')!;
						ctx.drawImage(bitmap, 0, 0);
						const blob = await new Promise<Blob>((r) =>
							canvas.toBlob((b) => r(b!), 'image/jpeg', 0.95)
						);
						const jpgBytes = new Uint8Array(await blob.arrayBuffer());
						image = await pdf.embedJpg(jpgBytes);
					} else {
						image = await pdf.embedJpg(uint8);
					}
				}

				const page = pdf.addPage([image.width, image.height]);
				page.drawImage(image, {
					x: 0,
					y: 0,
					width: image.width,
					height: image.height
				});
			}

			const pdfBytes = await pdf.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'images.pdf';
			a.click();
			URL.revokeObjectURL(url);
			trackConversion('jpg-to-pdf');
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
			accept=".jpg,.jpeg,.png,.webp,.gif,.bmp"
			label="Drop images here or click to browse"
			onfiles={handleFiles}
		/>

		{#if files.length > 0}
			<div class="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
				{#each files as f, i}
					<div class="group relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
						<img
							src={f.preview}
							alt={f.name}
							class="aspect-[3/4] w-full object-cover"
						/>
						<div
							class="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
						>
							<button
								onclick={() => moveFile(i, i - 1)}
								disabled={i === 0}
								class="rounded bg-white/90 p-1 text-neutral-700 disabled:opacity-30"
								aria-label="Move left"
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button
								onclick={() => removeFile(i)}
								class="rounded bg-white/90 p-1 text-red-600"
								aria-label="Remove"
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
							<button
								onclick={() => moveFile(i, i + 1)}
								disabled={i === files.length - 1}
								class="rounded bg-white/90 p-1 text-neutral-700 disabled:opacity-30"
								aria-label="Move right"
							>
								<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
						<p class="truncate px-1.5 py-1 text-[10px] text-neutral-500 dark:text-neutral-400">
							{f.name}
						</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={convert}
			disabled={files.length === 0 || isConverting}
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
				Convert {files.length} image{files.length !== 1 ? 's' : ''} to PDF
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free JPG to PDF converter — no upload required
		</h2>
		<p class="mb-3">
			Convert JPG, JPEG, PNG and other image formats to PDF entirely in your browser. Add multiple
			images, reorder them, and combine them into a single PDF document. Your images never leave
			your device.
		</p>
		<p class="mb-3">
			Each image becomes a page in the PDF at its original resolution. No quality loss, no
			compression artifacts — your images are embedded directly into the PDF using pdf-lib.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to convert images to PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Drop your images into the upload area or click to browse</li>
			<li>Reorder images by using the arrow buttons</li>
			<li>Click "Convert to PDF" to create your document</li>
			<li>The PDF downloads automatically</li>
		</ol>
	{/snippet}
</ToolPageLayout>
