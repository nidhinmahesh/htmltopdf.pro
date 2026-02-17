<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import NavHeader from '$lib/components/NavHeader.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { initGtag } from '$lib/analytics/gtag';

	let { children } = $props();

	onMount(() => {
		initGtag();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-white transition-colors dark:bg-neutral-950">
	<NavHeader />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>
