<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('add-page-numbers')!;

	type Position =
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right'
		| 'top-left'
		| 'top-center'
		| 'top-right';

	type Format = 'bare' | 'page-n' | 'page-n-of-total' | 'n-of-total';

	let file = $state<File | null>(null);
	let position = $state<Position>('bottom-center');
	let format = $state<Format>('bare');
	let startNum = $state(1);
	let fontSize = $state(12);
	let isProcessing = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
		}
	}

	function buildLabel(pageNum: number, total: number): string {
		switch (format) {
			case 'page-n':
				return `Page ${pageNum}`;
			case 'page-n-of-total':
				return `Page ${pageNum} of ${total}`;
			case 'n-of-total':
				return `${pageNum} / ${total}`;
			default:
				return String(pageNum);
		}
	}

	async function addNumbers() {
		if (!file || isProcessing) return;
		isProcessing = true;
		error = '';

		try {
			const { PDFDocument, rgb, StandardFonts, degrees } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes);
			const font = await doc.embedFont(StandardFonts.Helvetica);
			const pages = doc.getPages();
			const total = pages.length;
			// margin from edge in points — 36pt = 0.5 inch, safely inside printable area
			const margin = 36;
			const isTop = position.startsWith('top');

			pages.forEach((page, i) => {
				const pageNum = startNum + i;
				const label = buildLabel(pageNum, total + startNum - 1);

				const { width: rawW, height: rawH } = page.getSize();
				const rotation = page.getRotation().angle;

				// Visual dimensions after rotation
				const isSwapped = rotation === 90 || rotation === 270;
				const vW = isSwapped ? rawH : rawW;
				const vH = isSwapped ? rawW : rawH;

				const textWidth = font.widthOfTextAtSize(label, fontSize);

				// Position in visual space
				const vy = isTop ? vH - margin : margin;
				let vx: number;
				if (position.endsWith('left')) vx = margin;
				else if (position.endsWith('right')) vx = vW - textWidth - margin;
				else vx = (vW - textWidth) / 2;

				// Convert visual coords → raw coords based on page rotation
				let rawX: number, rawY: number;
				if (rotation === 0 || rotation === 360) {
					rawX = vx;
					rawY = vy;
				} else if (rotation === 90) {
					rawX = vy;
					rawY = rawW - vx - textWidth;
				} else if (rotation === 180) {
					rawX = rawW - vx - textWidth;
					rawY = rawH - vy;
				} else {
					// 270
					rawX = rawH - vy;
					rawY = vx;
				}

				page.drawText(label, {
					x: rawX,
					y: rawY,
					size: fontSize,
					font,
					color: rgb(0.15, 0.15, 0.15),
					// Counter-rotate the text so it reads normally on rotated pages
					rotate: degrees(-rotation)
				});
			});

			const pdfBytes = await doc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `numbered-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
			trackConversion('add-page-numbers');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add page numbers';
		} finally {
			isProcessing = false;
		}
	}

	const positions: { value: Position; label: string; row: 0 | 1 }[] = [
		{ value: 'top-left', label: 'Top Left', row: 0 },
		{ value: 'top-center', label: 'Top Center', row: 0 },
		{ value: 'top-right', label: 'Top Right', row: 0 },
		{ value: 'bottom-left', label: 'Bottom Left', row: 1 },
		{ value: 'bottom-center', label: 'Bottom Center', row: 1 },
		{ value: 'bottom-right', label: 'Bottom Right', row: 1 }
	];

	const formats: { value: Format; label: string; example: string }[] = [
		{ value: 'bare', label: 'Number only', example: '1, 2, 3' },
		{ value: 'page-n', label: 'Page N', example: 'Page 1' },
		{ value: 'page-n-of-total', label: 'Page N of Total', example: 'Page 1 of 12' },
		{ value: 'n-of-total', label: 'N / Total', example: '1 / 12' }
	];
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone
			accept=".pdf"
			multiple={false}
			label="Drop a PDF file here or click to browse"
			onfiles={handleFiles}
		/>

		{#if file}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
			>
				<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{file.name}</p>
			</div>

			<div class="mt-4 space-y-5">
				<!-- Position grid -->
				<div>
					<p class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Position</p>
					<div class="grid grid-cols-3 gap-2">
						{#each positions.filter((p) => p.row === 0) as opt}
							<button
								onclick={() => (position = opt.value)}
								class="rounded-lg px-2 py-2 text-xs font-medium transition-colors
										{position === opt.value
									? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
									: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
							>
								{opt.label}
							</button>
						{/each}
						{#each positions.filter((p) => p.row === 1) as opt}
							<button
								onclick={() => (position = opt.value)}
								class="rounded-lg px-2 py-2 text-xs font-medium transition-colors
										{position === opt.value
									? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
									: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Format -->
				<div>
					<p class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">Format</p>
					<div class="grid grid-cols-2 gap-2">
						{#each formats as fmt}
							<button
								onclick={() => (format = fmt.value)}
								class="flex flex-col rounded-lg px-3 py-2 text-left transition-colors
										{format === fmt.value
									? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
									: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
							>
								<span class="text-xs font-medium">{fmt.label}</span>
								<span
									class="mt-0.5 text-xs opacity-60"
								>{fmt.example}</span>
							</button>
						{/each}
					</div>
				</div>

				<!-- Start number + font size -->
				<div class="grid grid-cols-2 gap-3">
					<div>
						<label
							for="start-num"
							class="mb-1 block text-sm text-neutral-600 dark:text-neutral-400"
						>
							Start number
						</label>
						<input
							id="start-num"
							bind:value={startNum}
							type="number"
							min="0"
							class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
									focus:border-neutral-400 focus:outline-none
									dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
						/>
					</div>
					<div>
						<label
							for="font-size"
							class="mb-1 block text-sm text-neutral-600 dark:text-neutral-400"
						>
							Font size (pt)
						</label>
						<input
							id="font-size"
							bind:value={fontSize}
							type="number"
							min="6"
							max="36"
							class="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
									focus:border-neutral-400 focus:outline-none
									dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
						/>
					</div>
				</div>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={addNumbers}
			disabled={!file || isProcessing}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
		>
			{#if isProcessing}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Adding numbers…
				</span>
			{:else}
				Add Page Numbers
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free page numbering tool — add numbers to PDF without uploading
		</h2>
		<p class="mb-3">
			Add page numbers to any PDF entirely in your browser using pdf-lib. Choose from 6 positions
			(top or bottom, left, center, or right), 4 formats including "Page N of Total", a custom
			starting number, and font size. Your files never leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			How to add page numbers
		</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Choose position, format, starting number, and font size</li>
			<li>Click "Add Page Numbers" — the numbered PDF downloads immediately</li>
		</ol>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">
			Choosing the right format
		</h3>
		<p class="mb-3">
			Use <strong class="text-neutral-700 dark:text-neutral-300">Number only</strong> for clean,
			minimal page numbers. Use
			<strong class="text-neutral-700 dark:text-neutral-300">Page N of Total</strong> for reports
			and documents where readers need context about document length. The starting number lets you
			skip numbering cover pages — set it to 0 to start from 0, or 3 if your first two pages are a
			cover and table of contents.
		</p>
	{/snippet}
</ToolPageLayout>
