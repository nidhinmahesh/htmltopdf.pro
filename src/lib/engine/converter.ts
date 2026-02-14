import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ConvertOptions {
	filename?: string;
	format?: 'a4' | 'letter';
	margin?: number;
	scale?: number;
}

const defaults: Required<ConvertOptions> = {
	filename: 'converted.pdf',
	format: 'a4',
	margin: 10,
	scale: 2
};

// Page dimensions in mm
const PAGE_SIZES = {
	a4: { width: 210, height: 297 },
	letter: { width: 215.9, height: 279.4 }
} as const;

/**
 * Renders the HTML in a real iframe so the browser's rendering engine
 * executes all <script> tags (Tailwind CDN, Chart.js, etc.),
 * loads all <link> stylesheets and Google Fonts, and processes all CSS.
 * Then captures the fully-rendered result with html2canvas.
 */
export async function convertHtmlToPdf(
	html: string,
	options: ConvertOptions = {}
): Promise<Blob> {
	const opts = { ...defaults, ...options };
	const page = PAGE_SIZES[opts.format];
	const contentWidthMm = page.width - opts.margin * 2;
	const contentHeightMm = page.height - opts.margin * 2;

	// Pixels per mm at the given scale
	const pxPerMm = (96 / 25.4) * opts.scale;
	const iframeWidthPx = Math.round(contentWidthMm * pxPerMm);

	const iframe = document.createElement('iframe');
	iframe.style.position = 'fixed';
	iframe.style.left = '-10000px';
	iframe.style.top = '0';
	iframe.style.width = `${iframeWidthPx}px`;
	iframe.style.height = '100vh';
	iframe.style.border = 'none';
	iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
	document.body.appendChild(iframe);

	try {
		// Write the full HTML into the iframe so the browser renders it
		// as a real page — executing scripts, loading resources, etc.
		await loadHtmlInIframe(iframe, html);

		const iframeDoc = iframe.contentDocument!;
		const body = iframeDoc.body;

		// Let the iframe content expand to its full natural height
		iframe.style.height = `${body.scrollHeight}px`;

		const canvas = await html2canvas(body, {
			scale: 1, // Already scaled via iframe width
			useCORS: true,
			allowTaint: true,
			logging: false,
			width: iframeWidthPx,
			height: body.scrollHeight,
			windowWidth: iframeWidthPx,
			windowHeight: body.scrollHeight
		});

		// Paginate the canvas into a multi-page PDF
		const pdf = new jsPDF({
			unit: 'mm',
			format: opts.format,
			orientation: 'portrait'
		});

		const contentHeightPx = Math.round(contentHeightMm * pxPerMm);
		const totalPages = Math.ceil(canvas.height / contentHeightPx);

		for (let i = 0; i < totalPages; i++) {
			if (i > 0) pdf.addPage();

			// Slice this page's portion from the full canvas
			const sliceHeight = Math.min(contentHeightPx, canvas.height - i * contentHeightPx);
			const pageCanvas = document.createElement('canvas');
			pageCanvas.width = canvas.width;
			pageCanvas.height = sliceHeight;

			const ctx = pageCanvas.getContext('2d')!;
			ctx.drawImage(
				canvas,
				0, i * contentHeightPx, // source x, y
				canvas.width, sliceHeight, // source w, h
				0, 0, // dest x, y
				canvas.width, sliceHeight // dest w, h
			);

			const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
			const imgWidthMm = contentWidthMm;
			const imgHeightMm = (sliceHeight / canvas.width) * imgWidthMm;

			pdf.addImage(imgData, 'JPEG', opts.margin, opts.margin, imgWidthMm, imgHeightMm);
		}

		return pdf.output('blob');
	} finally {
		document.body.removeChild(iframe);
	}
}

/**
 * Loads HTML into an iframe and waits for:
 * 1. The document to finish loading (fires onload)
 * 2. External scripts to execute (Tailwind CDN, Chart.js)
 * 3. Google Fonts to finish loading
 * 4. A settling delay for async rendering (Chart.js animations, etc.)
 */
function loadHtmlInIframe(iframe: HTMLIFrameElement, html: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			reject(new Error('Iframe rendering timed out after 30s'));
		}, 30000);

		iframe.onload = async () => {
			try {
				const iframeDoc = iframe.contentDocument;
				if (!iframeDoc) throw new Error('Cannot access iframe document');

				// Wait for all fonts to load within the iframe
				if (iframeDoc.fonts) {
					await iframeDoc.fonts.ready;
				}

				// Wait for images inside the iframe to finish loading
				const images = Array.from(iframeDoc.querySelectorAll('img'));
				await Promise.all(
					images.map(
						(img) =>
							new Promise<void>((res) => {
								if (img.complete) return res();
								img.onload = () => res();
								img.onerror = () => res();
							})
					)
				);

				// Give async scripts (Tailwind CDN, Chart.js) time to execute and render
				await new Promise((r) => setTimeout(r, 2000));

				clearTimeout(timeout);
				resolve();
			} catch (e) {
				clearTimeout(timeout);
				reject(e);
			}
		};

		iframe.onerror = () => {
			clearTimeout(timeout);
			reject(new Error('Failed to load HTML in iframe'));
		};

		// Use srcdoc to load the full HTML document into the iframe
		iframe.srcdoc = html;
	});
}

export function detectInputType(value: string): 'url' | 'html' | 'empty' {
	const trimmed = value.trim();
	if (!trimmed) return 'empty';
	if (/^(https?:\/\/|www\.)/i.test(trimmed)) return 'url';
	return 'html';
}

export async function resolveInput(value: string): Promise<string> {
	const type = detectInputType(value);

	switch (type) {
		case 'url': {
			const url = value.trim().startsWith('www.') ? `https://${value.trim()}` : value.trim();
			const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
			const response = await fetch(proxyUrl);
			if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);
			return await response.text();
		}
		case 'html':
			return value;
		case 'empty':
			throw new Error('No input provided');
	}
}
