<script lang="ts">
	let {
		accept = '.pdf',
		multiple = true,
		label = 'Drop files here or click to browse',
		onfiles
	}: {
		accept?: string;
		multiple?: boolean;
		label?: string;
		onfiles: (files: File[]) => void;
	} = $props();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		const files = Array.from(e.dataTransfer?.files ?? []);
		if (files.length) onfiles(files);
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = Array.from(target.files ?? []);
		if (files.length) onfiles(files);
		target.value = '';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed
			border-neutral-300 bg-neutral-50 px-6 py-8 transition-colors
			hover:border-neutral-400 hover:bg-neutral-100
			dark:border-neutral-700 dark:bg-neutral-900
			dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
	class:border-blue-400={isDragOver}
	class:bg-blue-50={isDragOver}
	class:dark:border-blue-500={isDragOver}
	class:dark:bg-blue-950={isDragOver}
	role="button"
	tabindex="0"
	ondragover={(e) => {
		e.preventDefault();
		isDragOver = true;
	}}
	ondragleave={() => (isDragOver = false)}
	ondrop={handleDrop}
	onclick={() => fileInput.click()}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') fileInput.click();
	}}
>
	<svg
		class="mb-3 h-10 w-10 text-neutral-400 dark:text-neutral-500"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		viewBox="0 0 24 24"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
		/>
	</svg>
	<p class="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</p>
	<p class="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
		{accept.replace(/\./g, '').toUpperCase()} files
		{#if multiple}— select multiple{/if}
	</p>

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		class="hidden"
		onchange={handleFileSelect}
	/>
</div>
