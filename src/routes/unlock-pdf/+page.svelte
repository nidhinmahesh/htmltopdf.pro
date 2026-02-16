<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';

	const tool = getToolBySlug('unlock-pdf')!;

	let file = $state<File | null>(null);
	let password = $state('');
	let isProcessing = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const pdf = files.find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
		if (pdf) {
			file = pdf;
			error = '';
		}
	}

	async function unlock() {
		if (!file || isProcessing) return;
		isProcessing = true;
		error = '';

		try {
			const { PDFDocument } = await import('pdf-lib');
			const bytes = await file.arrayBuffer();

			// Try to load with the provided password
			const doc = await PDFDocument.load(bytes, {
				password: password || undefined,
				ignoreEncryption: true
			});

			// Save without encryption
			const pdfBytes = await doc.save();
			const blob = new Blob([pdfBytes], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `unlocked-${file.name}`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to unlock PDF. Check the password.';
		} finally {
			isProcessing = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone accept=".pdf" multiple={false} label="Drop a protected PDF here or click to browse" onfiles={handleFiles} />

		{#if file}
			<div
				class="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3
						dark:border-neutral-800 dark:bg-neutral-900"
			>
				<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{file.name}</p>
			</div>

			<div class="mt-4">
				<label class="text-sm text-neutral-600 dark:text-neutral-400">
					Password (if required)
				</label>
				<input
					bind:value={password}
					type="password"
					class="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm
							focus:border-neutral-400 focus:outline-none
							dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
					placeholder="Enter PDF password"
				/>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={unlock}
			disabled={!file || isProcessing}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
		>
			{#if isProcessing}
				<span class="inline-flex items-center gap-2">
					<span class="spinner"></span>
					Unlocking...
				</span>
			{:else}
				Unlock PDF
			{/if}
		</button>

		<p class="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
			Your password never leaves your browser.
		</p>
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free PDF unlocker — remove password without uploading
		</h2>
		<p class="mb-3">
			Remove password protection from PDFs you own, entirely in your browser. Enter the current
			password and download an unlocked copy. Your files and password never leave your device.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to unlock a PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Upload your password-protected PDF</li>
			<li>Enter the current password</li>
			<li>Click "Unlock PDF" and download the unprotected version</li>
		</ol>
	{/snippet}
</ToolPageLayout>
