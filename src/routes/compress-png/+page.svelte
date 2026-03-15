<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('compress-png')!;

	type OutputFormat = 'webp' | 'png';

	interface CompressResult {
		blob: Blob;
		url: string;
		size: number;
		format: OutputFormat;
		quality: number;
	}

	interface Entry {
		id: number;
		file: File;
		result: CompressResult | null;
		error: string;
		processing: boolean;
	}

	let entries = $state<Entry[]>([]);
	let outputFormat = $state<OutputFormat>('webp');
	let quality = $state(80);
	let useTargetSize = $state(false);
	let targetKB = $state(200);
	let isProcessing = $state(false);
	let nextId = 0;

	function handleFiles(files: File[]) {
		const pngs = files.filter((f) => f.type === 'image/png' || /\.png$/i.test(f.name));
		entries = [
			...entries,
			...pngs.map((f) => ({
				id: nextId++,
				file: f,
				result: null,
				error: '',
				processing: false
			}))
		];
	}

	function removeEntry(id: number) {
		const entry = entries.find((e) => e.id === id);
		if (entry?.result?.url) URL.revokeObjectURL(entry.result.url);
		entries = entries.filter((e) => e.id !== id);
	}

	function updateEntry(id: number, update: Partial<Entry>) {
		entries = entries.map((e) => (e.id === id ? { ...e, ...update } : e));
	}

	async function binarySearchQuality(
		canvas: HTMLCanvasElement,
		mimeType: string,
		targetBytes: number
	): Promise<{ blob: Blob; quality: number }> {
		const hiBlob = await new Promise<Blob>((r) =>
			canvas.toBlob((b) => r(b!), mimeType, 1.0)
		);
		if (hiBlob.size <= targetBytes) return { blob: hiBlob, quality: 100 };

		let lo = 0.01,
			hi = 1.0;
		let best = { blob: hiBlob, quality: 100 };

		for (let i = 0; i < 14; i++) {
			const mid = (lo + hi) / 2;
			const blob = await new Promise<Blob>((r) =>
				canvas.toBlob((b) => r(b!), mimeType, mid)
			);
			if (blob.size <= targetBytes) {
				best = { blob, quality: Math.round(mid * 100) };
				lo = mid;
			} else {
				hi = mid;
			}
		}
		return best;
	}

	async function processEntry(id: number): Promise<void> {
		const entry = entries.find((e) => e.id === id);
		if (!entry) return;

		updateEntry(id, { processing: true, error: '', result: null });

		try {
			const bitmap = await createImageBitmap(entry.file);
			const canvas = document.createElement('canvas');
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(bitmap, 0, 0);
			bitmap.close();

			const mimeType = outputFormat === 'webp' ? 'image/webp' : 'image/png';
			let blob: Blob;
			let finalQuality: number;

			if (useTargetSize) {
				const r = await binarySearchQuality(canvas, mimeType, targetKB * 1024);
				blob = r.blob;
				finalQuality = r.quality;
			} else if (outputFormat === 'webp') {
				blob = await new Promise<Blob>((r) =>
					canvas.toBlob((b) => r(b!), 'image/webp', quality / 100)
				);
				finalQuality = quality;
			} else {
				// PNG re-encode — lossless, browser picks compression level
				blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
				finalQuality = 100;
			}

			const url = URL.createObjectURL(blob);
			updateEntry(id, {
				processing: false,
				result: { blob, url, size: blob.size, format: outputFormat, quality: finalQuality }
			});
		} catch (e) {
			updateEntry(id, {
				processing: false,
				error: e instanceof Error ? e.message : 'Compression failed'
			});
		}
	}

	async function compressAll() {
		if (isProcessing || entries.length === 0) return;
		isProcessing = true;
		await Promise.all(entries.map((e) => processEntry(e.id)));
		trackConversion('compress-png');
		isProcessing = false;
	}

	function download(entry: Entry) {
		if (!entry.result) return;
		const ext = entry.result.format === 'webp' ? 'webp' : 'png';
		const a = document.createElement('a');
		a.href = entry.result.url;
		a.download = entry.file.name.replace(/\.png$/i, `-compressed.${ext}`);
		a.click();
	}

	function downloadAll() {
		for (const entry of entries.filter((e) => e.result)) download(entry);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	function savingPct(entry: Entry): number {
		if (!entry.result) return 0;
		return Math.round((1 - entry.result.size / entry.file.size) * 100);
	}

	const hasResults = $derived(entries.some((e) => e.result !== null));
	const doneCount = $derived(entries.filter((e) => e.result !== null).length);
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone
			accept=".png"
			label="Drop PNG images here or click to browse"
			onfiles={handleFiles}
		/>

		{#if entries.length > 0}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="space-y-4">
					<!-- Output format -->
					<div>
						<p class="mb-2 text-sm text-neutral-700 dark:text-neutral-300">Output format</p>
						<div class="flex flex-wrap gap-4">
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									bind:group={outputFormat}
									value="webp"
									class="h-4 w-4"
								/>
								<span class="text-sm text-neutral-700 dark:text-neutral-300">
									WebP <span class="text-neutral-400">(recommended — smaller files)</span>
								</span>
							</label>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									bind:group={outputFormat}
									value="png"
									class="h-4 w-4"
								/>
								<span class="text-sm text-neutral-700 dark:text-neutral-300">
									PNG <span class="text-neutral-400">(lossless re-encode)</span>
								</span>
							</label>
						</div>
					</div>

					<!-- Quality slider — only meaningful for WebP -->
					{#if outputFormat === 'webp' && !useTargetSize}
						<div>
							<div
								class="mb-1 flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400"
							>
								<span>Quality</span>
								<span class="font-medium text-neutral-800 dark:text-neutral-200">{quality}%</span>
							</div>
							<input
								type="range"
								bind:value={quality}
								min="1"
								max="100"
								class="w-full accent-neutral-800 dark:accent-neutral-200"
							/>
							<div class="mt-0.5 flex justify-between text-xs text-neutral-400">
								<span>Smaller file</span>
								<span>Higher quality</span>
							</div>
						</div>
					{/if}

					<!-- Target size -->
					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" bind:checked={useTargetSize} class="h-4 w-4 rounded" />
						<span class="text-sm text-neutral-700 dark:text-neutral-300">Compress to target size</span>
					</label>

					{#if useTargetSize}
						<div class="flex items-center gap-2">
							<span class="text-sm text-neutral-600 dark:text-neutral-400">Target:</span>
							<input
								type="number"
								bind:value={targetKB}
								min="1"
								max="99999"
								class="w-24 rounded border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
							/>
							<span class="text-sm text-neutral-500">KB</span>
						</div>
					{/if}
				</div>

				<button
					onclick={compressAll}
					disabled={isProcessing}
					class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white
							transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40
							dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
				>
					{#if isProcessing}
						<span class="inline-flex items-center gap-2">
							<span class="spinner"></span>
							Compressing…
						</span>
					{:else}
						Compress {entries.length} image{entries.length !== 1 ? 's' : ''}
					{/if}
				</button>
			</div>

			<div class="mt-4 space-y-2">
				{#each entries as entry (entry.id)}
					<div
						class="rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
					>
						<div class="flex items-center gap-3">
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
									{entry.file.name}
								</p>
								<p class="text-xs text-neutral-400">{formatSize(entry.file.size)}</p>
							</div>

							{#if entry.processing}
								<span class="shrink-0 text-xs text-neutral-400">Compressing…</span>
							{:else if entry.result}
								<div class="flex shrink-0 items-center gap-3">
									<div class="text-right">
										<p
											class="text-sm font-medium {savingPct(entry) > 0
												? 'text-green-600 dark:text-green-400'
												: 'text-neutral-500'}"
										>
											{savingPct(entry) > 0 ? `${savingPct(entry)}% smaller` : 'Similar size'}
										</p>
										<p class="text-xs text-neutral-400">
											{formatSize(entry.result.size)} · {entry.result.format.toUpperCase()}{entry
												.result.format === 'webp'
												? ` · q${entry.result.quality}%`
												: ''}
										</p>
									</div>
									<button
										onclick={() => download(entry)}
										class="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700
												dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
									>
										Download
									</button>
								</div>
							{:else if entry.error}
								<span class="shrink-0 text-xs text-red-500">{entry.error}</span>
							{/if}

							<button
								onclick={() => removeEntry(entry.id)}
								class="shrink-0 text-neutral-300 transition-colors hover:text-neutral-600
										dark:text-neutral-600 dark:hover:text-neutral-400"
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
					</div>
				{/each}
			</div>

			{#if hasResults && doneCount > 1}
				<button
					onclick={downloadAll}
					class="mt-3 w-full rounded-lg border border-neutral-200 px-4 py-2 text-sm text-neutral-700
							transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
				>
					Download all {doneCount} compressed images
				</button>
			{/if}
		{/if}
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PNG compressor — reduce PNG size or convert to WebP
		</h2>
		<p class="mb-3">
			Compress PNG images entirely in your browser — no upload, no server, no sign-up. Choose
			between lossless PNG re-encoding for modest file size reductions, or convert to WebP for
			significantly smaller files while preserving full transparency support.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			PNG vs WebP: which should you choose?
		</h3>
		<p class="mb-3">
			Choose <strong class="text-neutral-700 dark:text-neutral-300">PNG</strong> when you need to
			maintain the original format — for example, if you are sending images to a system that only
			accepts PNG, or images that will be further edited. Choose
			<strong class="text-neutral-700 dark:text-neutral-300">WebP</strong> when file size is the
			priority: WebP lossless images are typically 26% smaller than PNG, and WebP lossy images at
			80% quality are typically 25–50% smaller while remaining visually identical.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Does PNG compression remove transparency?
		</h3>
		<p class="mb-3">
			No. Both PNG and WebP support alpha transparency. Your transparent backgrounds, drop shadows,
			and cut-out images are fully preserved in the output. The browser Canvas API correctly handles
			alpha compositing, so no transparency data is lost during re-encoding.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Compress to a target file size
		</h3>
		<p class="mb-3">
			Enable target size mode and enter a limit in KB. The tool runs binary search over the quality
			range — up to 14 iterations — to find the highest quality that keeps the output under your
			limit. This is most effective with WebP output, where quality has a direct and predictable
			effect on file size.
		</p>
	{/snippet}
</ToolPageLayout>
