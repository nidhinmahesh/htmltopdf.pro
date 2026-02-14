<script lang="ts">
	import { Paperclip } from '@lucide/svelte';

	let {
		value = $bindable(''),
		onkeydown
	}: {
		value: string;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();

	let isDragOver = $state(false);
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
		const file = e.dataTransfer?.files[0];
		if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
			readFile(file);
		}
	}

	function readFile(file: File) {
		const reader = new FileReader();
		reader.onload = () => {
			value = reader.result as string;
		};
		reader.readAsText(file);
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) readFile(file);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative"
	role="region"
	aria-label="HTML input area"
	class:ring-2={isDragOver}
	class:ring-neutral-400={isDragOver}
	ondragover={(e) => {
		e.preventDefault();
		isDragOver = true;
	}}
	ondragleave={() => (isDragOver = false)}
	ondrop={handleDrop}
>
	<textarea
		bind:value
		{onkeydown}
		placeholder="Paste HTML, drop a file, or enter a URL"
		rows="8"
		class="w-full min-h-[200px] resize-none rounded-lg border border-neutral-200
				bg-neutral-50 px-4 py-3 font-mono text-sm
				placeholder:text-neutral-400
				focus:border-neutral-400 focus:outline-none
				dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100
				dark:placeholder:text-neutral-600"
	></textarea>

	<button
		onclick={() => fileInput.click()}
		class="absolute bottom-3 right-3 text-neutral-400
				hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
		aria-label="Upload HTML file"
		type="button"
	>
		<Paperclip size={18} />
	</button>

	<input
		bind:this={fileInput}
		type="file"
		accept=".html,.htm"
		class="hidden"
		onchange={handleFileSelect}
	/>
</div>
