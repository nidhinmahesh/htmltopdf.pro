<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('rotate-pdf')!;

	let file = $state<File | null>(null);
	let rotation = $state(90);
	let isRotating = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
		}
	}

	async function rotate() {
		if (!file || isRotating) return;
		isRotating = true;
		error = '';

		try {
			const { PDFDocument, degrees } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes);

			doc.getPages().forEach((page) => {
				page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
			});

			const pdfBytes = await doc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `rotated-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Rotation failed';
		} finally {
			isRotating = false;
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

			<div class="mt-4 flex gap-2">
				{#each [90, 180, 270] as deg}
					<button
						onclick={() => (rotation = deg)}
						class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors
								{rotation === deg
							? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
							: 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'}"
					>
						{deg}°
					</button>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={rotate}
			disabled={!file || isRotating}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
		>
			{#if isRotating}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Rotating...
				</span>
			{:else}
				Rotate {rotation}°
			{/if}
		</button>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF rotator — rotate pages without uploading
		</h2>
		<p class="mb-3">
			Rotate all pages of a PDF by 90, 180, or 270 degrees entirely in your browser. Fix
			sideways-scanned documents or landscape pages instantly. Your files never leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to rotate a PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your PDF file</li>
			<li>Select the rotation angle (90°, 180°, or 270°)</li>
			<li>Click "Rotate" and the corrected PDF downloads</li>
		</ol>
	{/snippet}
</ToolPageLayout>
