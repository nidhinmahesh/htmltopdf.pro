<script lang="ts">
	import { Github } from '@lucide/svelte';
</script>

<footer class="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
	<div class="mx-auto max-w-5xl px-4 py-8">
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
						clip-rule="evenodd"
					/>
				</svg>
				100% local. Nothing leaves your browser.
			</div>

			<div class="flex items-center gap-4">
				<a
					href="https://github.com/nidhinmahesh/htmltopdf.pro"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600
							dark:text-neutral-500 dark:hover:text-neutral-300"
				>
					<Github size={14} />
					Open source
				</a>
				<span class="text-neutral-300 dark:text-neutral-700">|</span>
				<span class="text-xs text-neutral-400 dark:text-neutral-500">
					sponsored by
					<a
						href="https://getfexr.com"
						target="_blank"
						rel="noopener noreferrer"
						class="underline underline-offset-2 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
					>
						Fexr
					</a>
				</span>
			</div>
		</div>
	</div>
</footer>
