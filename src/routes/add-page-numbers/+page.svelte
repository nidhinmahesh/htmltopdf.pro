<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('add-page-numbers')!;

	let file = $state<File | null>(null);
	let position = $state<'bottom-center' | 'bottom-right' | 'bottom-left'>('bottom-center');
	let startNum = $state(1);
	let isProcessing = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
		}
	}

	async function addNumbers() {
		if (!file || isProcessing) return;
		isProcessing = true;
		error = '';

		try {
			const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes);
			const font = await doc.embedFont(StandardFonts.Helvetica);
			const pages = doc.getPages();

			pages.forEach((page, i) => {
				const num = String(startNum + i);
				const { width, height } = page.getSize();
				const textWidth = font.widthOfTextAtSize(num, 10);

				let x: number;
				if (position === 'bottom-center') x = (width - textWidth) / 2;
				else if (position === 'bottom-right') x = width - textWidth - 30;
				else x = 30;

				page.drawText(num, {
					x,
					y: 20,
					size: 10,
					font,
					color: rgb(0.4, 0.4, 0.4)
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
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add page numbers';
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
					<label class="text-sm text-neutral-600 dark:text-neutral-400">Position</label>
					<div class="mt-1 flex gap-2">
						{#each [
							{ value: 'bottom-left', label: 'Left' },
							{ value: 'bottom-center', label: 'Center' },
							{ value: 'bottom-right', label: 'Right' }
						] as opt}
							<button
								onclick={() => (position = opt.value as typeof position)}
								class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors
										{position === opt.value
									? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
									: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label class="text-sm text-neutral-600 dark:text-neutral-400">Start number</label>
					<input
						bind:value={startNum}
						type="number"
						min="1"
						class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
								focus:border-neutral-400 focus:outline-none
								dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
					/>
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
					Adding numbers...
				</span>
			{:else}
				Add Page Numbers
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free page numbering tool — add numbers without uploading
		</h2>
		<p class="mb-3">
			Add page numbers to any PDF entirely in your browser. Choose the position (left, center, or
			right) and starting number. Your files never leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to add page numbers</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Choose the position and starting number</li>
			<li>Click "Add Page Numbers" and download the result</li>
		</ol>
	{/snippet}
</ToolPageLayout>
