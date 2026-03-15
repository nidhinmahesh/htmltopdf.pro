<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('compress-jpg')!;

	interface CompressResult {
		blob: Blob;
		url: string;
		size: number;
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
	let quality = $state(75);
	let useTargetSize = $state(false);
	let targetKB = $state(200);
	let isProcessing = $state(false);
	let nextId = 0;

	function handleFiles(files: File[]) {
		const jpegs = files.filter(
			(f) => f.type === 'image/jpeg' || /\.(jpg|jpeg)$/i.test(f.name)
		);
		entries = [
			...entries,
			...jpegs.map((f) => ({
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
		targetBytes: number
	): Promise<{ blob: Blob; quality: number }> {
		const hiBlob = await new Promise<Blob>((r) =>
			canvas.toBlob((b) => r(b!), 'image/jpeg', 1.0)
		);
		if (hiBlob.size <= targetBytes) return { blob: hiBlob, quality: 100 };

		let lo = 0.01,
			hi = 1.0;
		let best = { blob: hiBlob, quality: 100 };

		for (let i = 0; i < 14; i++) {
			const mid = (lo + hi) / 2;
			const blob = await new Promise<Blob>((r) =>
				canvas.toBlob((b) => r(b!), 'image/jpeg', mid)
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

			let blob: Blob;
			let finalQuality: number;

			if (useTargetSize) {
				const r = await binarySearchQuality(canvas, targetKB * 1024);
				blob = r.blob;
				finalQuality = r.quality;
			} else {
				blob = await new Promise<Blob>((r) =>
					canvas.toBlob((b) => r(b!), 'image/jpeg', quality / 100)
				);
				finalQuality = quality;
			}

			const url = URL.createObjectURL(blob);
			updateEntry(id, {
				processing: false,
				result: { blob, url, size: blob.size, quality: finalQuality }
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
		trackConversion('compress-jpg');
		isProcessing = false;
	}

	function download(entry: Entry) {
		if (!entry.result) return;
		const a = document.createElement('a');
		a.href = entry.result.url;
		a.download = entry.file.name.replace(/\.(jpg|jpeg)$/i, '-compressed.jpg');
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
			accept=".jpg,.jpeg"
			label="Drop JPG/JPEG images here or click to browse"
			onfiles={handleFiles}
		/>

		{#if entries.length > 0}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div class="space-y-4">
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
					{:else}
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
											{savingPct(entry) > 0 ? `${savingPct(entry)}% smaller` : 'No reduction'}
										</p>
										<p class="text-xs text-neutral-400">
											{formatSize(entry.result.size)} · q{entry.result.quality}%
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
			Free JPEG compressor — reduce JPG size without uploading
		</h2>
		<p class="mb-3">
			Compress JPG and JPEG images entirely in your browser using the Canvas API. Your photos never
			leave your device — no server, no upload, no sign-up. Drop multiple images, choose your quality
			level or set a target file size in KB, and download the results instantly.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Choosing the right quality level
		</h3>
		<p class="mb-3">
			For most photos, a quality of <strong class="text-neutral-700 dark:text-neutral-300">70–85%</strong>
			produces results indistinguishable from the original at normal viewing sizes, with file sizes
			40–60% smaller. Quality levels of 50–65% are good for web thumbnails where bandwidth matters.
			Below 40%, visible artifacts (blockiness, colour banding) become noticeable.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Compress to a target file size
		</h3>
		<p class="mb-3">
			The target size feature uses binary search over the JPEG quality range — running up to 14
			iterations — to find the highest quality setting that keeps your file under your specified
			limit. This is useful for email attachments, form uploads with size limits, or optimising
			images for pages with strict bandwidth budgets.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			How it works technically
		</h3>
		<p class="mb-3">
			Each image is decoded into a canvas element using
			<code class="rounded bg-neutral-100 px-1 text-xs dark:bg-neutral-800">createImageBitmap</code>,
			then re-encoded as JPEG via
			<code class="rounded bg-neutral-100 px-1 text-xs dark:bg-neutral-800">canvas.toBlob</code>
			at your chosen quality level. The Canvas API produces JPEG output equivalent to professional tools
			— all processing happens locally using your device's CPU.
		</p>
	{/snippet}
</ToolPageLayout>
