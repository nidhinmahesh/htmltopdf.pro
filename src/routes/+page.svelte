<script lang="ts">
	import UnifiedInput from '$lib/components/UnifiedInput.svelte';

	let inputValue = $state('');
	let isConverting = $state(false);
	let error = $state('');

	const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

	async function handleConvert() {
		if (!inputValue.trim() || isConverting) return;

		isConverting = true;
		error = '';

		try {
			const { resolveInput, convertHtmlToPdf } = await import('$lib/engine/converter');
			const html = await resolveInput(inputValue);
			const blob = await convertHtmlToPdf(html);

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'converted.pdf';
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			isConverting = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			handleConvert();
		}
	}
</script>

<main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20">
	<div class="mb-8 text-center">
		<h1 class="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
			HTMLtoPDF
		</h1>
		<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
			Your HTML &rarr; PDF. Locally. Privately.
		</p>
	</div>

	<UnifiedInput bind:value={inputValue} onkeydown={handleKeydown} />

	{#if error}
		<p class="mt-2 text-sm text-red-500">{error}</p>
	{/if}

	<button
		onclick={handleConvert}
		disabled={isConverting || !inputValue.trim()}
		class="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
				text-white transition-colors cursor-pointer
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
			Convert to PDF
		{/if}
	</button>

	<p class="mt-2 text-center text-xs text-neutral-400 dark:text-neutral-500">
		{isMac ? '\u2318' : 'Ctrl'}+Enter to convert
	</p>

	<div class="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
		<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
			<path
				fill-rule="evenodd"
				d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
				clip-rule="evenodd"
			/>
		</svg>
		100% local. Nothing leaves your browser.
	</div>

	<div class="mt-12 text-center text-xs text-neutral-400 dark:text-neutral-500">
		sponsored by
		<a
			href="https://getfexr.com"
			target="_blank"
			rel="noopener noreferrer"
			class="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
		>
			Fexr
		</a>
	</div>
</main>
