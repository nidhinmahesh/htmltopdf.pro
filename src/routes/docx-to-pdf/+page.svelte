<script lang="ts">
	import FileDropZone from '$lib/components/FileDropZone.svelte';
	import ToolPageLayout from '$lib/components/ToolPageLayout.svelte';
	import { getToolBySlug } from '$lib/tools/registry';
	import { trackConversion } from '$lib/analytics/gtag';

	const tool = getToolBySlug('docx-to-pdf')!;

	let file = $state<File | null>(null);
	let isConverting = $state(false);
	let error = $state('');

	function handleFiles(files: File[]) {
		const docx = files.find(
			(f) =>
				f.name.endsWith('.docx') ||
				f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		);
		if (docx) {
			file = docx;
			error = '';
		}
	}

	async function convert() {
		if (!file || isConverting) return;
		isConverting = true;
		error = '';

		try {
			const mammoth = await import('mammoth');
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.default.convertToHtml({
				arrayBuffer
			});

			if (!result.value.trim()) {
				throw new Error('No content found in the document');
			}

			// Render mammoth HTML in a hidden iframe with explicit white background,
			// then capture with html2canvas → jsPDF
			const html2canvas = (await import('html2canvas')).default;
			const { jsPDF } = await import('jspdf');

			const styledHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
	html, body {
		margin: 0;
		padding: 0;
		background: #ffffff;
	}
	body {
		font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Tahoma, Geneva, Verdana, sans-serif;
		line-height: 1.7;
		color: #1a1a1a;
		font-size: 14px;
		padding: 60px 60px;
		box-sizing: border-box;
	}
	h1 { font-size: 26px; margin: 0 0 16px; font-weight: 700; color: #111; }
	h2 { font-size: 22px; margin: 28px 0 12px; font-weight: 600; color: #111; }
	h3 { font-size: 18px; margin: 24px 0 10px; font-weight: 600; color: #222; }
	h4 { font-size: 16px; margin: 20px 0 8px; font-weight: 600; color: #222; }
	p { margin: 0 0 12px; }
	ul, ol { margin: 0 0 12px; padding-left: 28px; }
	li { margin: 3px 0; }
	table { border-collapse: collapse; width: 100%; margin: 16px 0; }
	th, td { border: 1px solid #d0d0d0; padding: 8px 12px; text-align: left; font-size: 13px; }
	th { background: #f0f0f0; font-weight: 600; }
	img { max-width: 100%; height: auto; margin: 8px 0; }
	strong, b { font-weight: 600; }
	em, i { font-style: italic; }
	a { color: #1a56db; text-decoration: underline; }
	blockquote { margin: 12px 0; padding: 8px 16px; border-left: 3px solid #d0d0d0; color: #555; }
	code { font-family: monospace; background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-size: 13px; }
	pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; margin: 12px 0; }
	pre code { background: none; padding: 0; }
	hr { border: none; border-top: 1px solid #e0e0e0; margin: 20px 0; }
</style>
</head>
<body>${result.value}</body>
</html>`;

			// Create iframe for rendering
			const iframe = document.createElement('iframe');
			// A4 width at 2x scale: 210mm * (96/25.4) * 2 = ~1587px
			const pxPerMm = (96 / 25.4) * 2;
			const iframeWidthPx = Math.round(210 * pxPerMm);

			iframe.style.position = 'fixed';
			iframe.style.left = '-10000px';
			iframe.style.top = '0';
			iframe.style.width = `${iframeWidthPx}px`;
			iframe.style.height = '100vh';
			iframe.style.border = 'none';
			document.body.appendChild(iframe);

			try {
				// Load HTML in iframe
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => reject(new Error('Render timed out')), 15000);
					iframe.onload = async () => {
						try {
							const doc = iframe.contentDocument;
							if (!doc) throw new Error('Cannot access iframe');

							// Wait for fonts and images
							if (doc.fonts) await doc.fonts.ready;
							const imgs = Array.from(doc.querySelectorAll('img'));
							await Promise.all(
								imgs.map(
									(img) =>
										new Promise<void>((r) => {
											if (img.complete) return r();
											img.onload = () => r();
											img.onerror = () => r();
										})
								)
							);
							// Short settle for rendering
							await new Promise((r) => setTimeout(r, 300));
							clearTimeout(timeout);
							resolve();
						} catch (e) {
							clearTimeout(timeout);
							reject(e);
						}
					};
					iframe.srcdoc = styledHtml;
				});

				const body = iframe.contentDocument!.body;
				iframe.style.height = `${body.scrollHeight}px`;

				const canvas = await html2canvas(body, {
					scale: 1,
					useCORS: true,
					allowTaint: true,
					logging: false,
					backgroundColor: '#ffffff',
					width: iframeWidthPx,
					height: body.scrollHeight,
					windowWidth: iframeWidthPx,
					windowHeight: body.scrollHeight
				});

				// Paginate into A4 pages
				const pageWidthMm = 210;
				const pageHeightMm = 297;
				const contentHeightPx = canvas.height;
				const pageHeightPx = Math.round(pageHeightMm * pxPerMm);

				const pageCount = Math.max(1, Math.ceil(contentHeightPx / pageHeightPx));

				const pdf = new jsPDF({
					unit: 'mm',
					format: 'a4',
					orientation: 'portrait'
				});

				for (let i = 0; i < pageCount; i++) {
					if (i > 0) pdf.addPage();

					const srcY = i * pageHeightPx;
					const sliceHeight = Math.min(pageHeightPx, contentHeightPx - srcY);

					const pageCanvas = document.createElement('canvas');
					pageCanvas.width = canvas.width;
					pageCanvas.height = sliceHeight;

					const ctx = pageCanvas.getContext('2d')!;
					// Fill white background to prevent any transparency artifacts
					ctx.fillStyle = '#ffffff';
					ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
					ctx.drawImage(
						canvas,
						0,
						srcY,
						canvas.width,
						sliceHeight,
						0,
						0,
						canvas.width,
						sliceHeight
					);

					const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
					const imgWidthMm = pageWidthMm;
					const imgHeightMm = (sliceHeight / canvas.width) * pageWidthMm;

					pdf.addImage(imgData, 'JPEG', 0, 0, imgWidthMm, imgHeightMm);
				}

				const blob = pdf.output('blob');
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = file.name.replace(/\.docx$/i, '.pdf');
				a.click();
				URL.revokeObjectURL(url);
				trackConversion('docx-to-pdf');
			} finally {
				document.body.removeChild(iframe);
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Conversion failed';
		} finally {
			isConverting = false;
		}
	}
</script>

<ToolPageLayout {tool}>
	{#snippet children()}
		<FileDropZone
			accept=".docx"
			multiple={false}
			label="Drop a Word document here or click to browse"
			onfiles={handleFiles}
		/>

		{#if file}
			<div
				class="mt-4 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3
						dark:border-neutral-800 dark:bg-neutral-900"
			>
				<div>
					<p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">{file.name}</p>
					<p class="text-xs text-neutral-400 dark:text-neutral-500">
						{(file.size / 1024).toFixed(1)} KB
					</p>
				</div>
				<button
					onclick={() => {
						file = null;
						error = '';
					}}
					class="text-neutral-400 transition-colors hover:text-red-500"
					aria-label="Remove"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}

		<button
			onclick={convert}
			disabled={!file || isConverting}
			class="mt-4 w-full cursor-pointer rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
					text-white transition-colors hover:bg-neutral-800
					disabled:cursor-not-allowed disabled:opacity-40
					dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
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
	{/snippet}

	{#snippet article()}
		<h2 class="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
			Free DOCX to PDF converter — no upload required
		</h2>
		<p class="mb-3">
			Convert Microsoft Word documents (.docx) to PDF entirely in your browser. The document is
			parsed client-side using mammoth.js, which extracts headings, paragraphs, lists, tables,
			bold, italic, and embedded images. The content is then rendered as a styled HTML page and
			captured as a clean PDF. Your files never leave your device.
		</p>
		<p class="mb-3">
			Unlike online Word-to-PDF converters that upload your documents to remote servers,
			HTMLtoPDF.pro processes everything locally. This makes it ideal for sensitive documents like
			contracts, resumes, reports, and legal papers.
		</p>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">How to convert Word to PDF</h3>
		<ol class="mb-3 list-decimal space-y-1 pl-5">
			<li>Drop your .docx file or click to browse</li>
			<li>Click "Convert to PDF"</li>
			<li>The PDF downloads automatically — nothing is uploaded</li>
		</ol>

		<h3 class="mb-2 mt-6 font-semibold text-neutral-700 dark:text-neutral-300">Supported formatting</h3>
		<ul class="mb-3 list-disc space-y-1 pl-5">
			<li>Headings (H1–H6), paragraphs, line breaks</li>
			<li>Bold, italic, underline, strikethrough</li>
			<li>Ordered and unordered lists</li>
			<li>Tables with headers</li>
			<li>Embedded images</li>
			<li>Hyperlinks</li>
		</ul>
	{/snippet}
</ToolPageLayout>
