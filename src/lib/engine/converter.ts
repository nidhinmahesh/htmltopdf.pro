import html2pdf from 'html2pdf.js';

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

export async function convertHtmlToPdf(
	html: string,
	options: ConvertOptions = {}
): Promise<Blob> {
	const opts = { ...defaults, ...options };

	const container = document.createElement('div');
	container.style.position = 'absolute';
	container.style.left = '-9999px';
	container.style.width = '210mm';
	container.innerHTML = html;
	document.body.appendChild(container);

	try {
		const blob: Blob = await html2pdf()
			.set({
				margin: opts.margin,
				filename: opts.filename,
				image: { type: 'jpeg', quality: 0.98 },
				html2canvas: {
					scale: opts.scale,
					useCORS: true,
					logging: false
				},
				jsPDF: {
					unit: 'mm',
					format: opts.format,
					orientation: 'portrait'
				}
			})
			.from(container)
			.outputPdf('blob');

		return blob;
	} finally {
		document.body.removeChild(container);
	}
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
