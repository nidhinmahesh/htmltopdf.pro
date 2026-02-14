<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="min-h-screen bg-white dark:bg-neutral-950 transition-colors">
	{@render children()}
</div>
