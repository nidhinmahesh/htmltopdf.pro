export interface Tool {
	slug: string;
	name: string;
	description: string;
	icon: string;
	keywords: string[];
	metaTitle: string;
	metaDescription: string;
	category: 'convert' | 'optimize' | 'organize' | 'security';
	relatedSlugs: string[];
}

export const tools: Tool[] = [
	{
		slug: 'html-to-pdf',
		name: 'HTML to PDF',
		description: 'Convert HTML to PDF locally in your browser',
		icon: 'FileCode',
		keywords: ['html to pdf', 'convert html', 'html converter', 'gemini infographic'],
		metaTitle: 'Free HTML to PDF Converter — No Upload, 100% in Browser',
		metaDescription:
			'Convert HTML to PDF entirely in your browser. Optimized for Gemini infographics. No uploads, no servers, no tracking. Smart page fitting eliminates half-empty pages.',
		category: 'convert',
		relatedSlugs: ['merge-pdf', 'compress-pdf', 'jpg-to-pdf']
	},
	{
		slug: 'merge-pdf',
		name: 'Merge PDF',
		description: 'Combine multiple PDFs into one document',
		icon: 'FilePlus2',
		keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger'],
		metaTitle: 'Free Merge PDF — Combine PDFs Online, No Upload',
		metaDescription:
			'Merge multiple PDF files into one document entirely in your browser. Drag, drop, reorder and combine. No uploads, no servers — 100% private.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'reorder-pages', 'compress-pdf']
	},
	{
		slug: 'compress-pdf',
		name: 'Compress PDF',
		description: 'Reduce PDF file size without losing quality',
		icon: 'FileDown',
		keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'pdf compressor'],
		metaTitle: 'Free Compress PDF — Reduce File Size, No Upload',
		metaDescription:
			'Compress PDF files in your browser by downscaling images and removing metadata. No uploads, no servers — your files stay on your device.',
		category: 'optimize',
		relatedSlugs: ['merge-pdf', 'split-pdf', 'jpg-to-pdf']
	},
	{
		slug: 'jpg-to-pdf',
		name: 'JPG to PDF',
		description: 'Convert images to a PDF document',
		icon: 'ImagePlus',
		keywords: ['jpg to pdf', 'image to pdf', 'jpeg to pdf', 'photo to pdf'],
		metaTitle: 'Free JPG to PDF — Convert Images to PDF, No Upload',
		metaDescription:
			'Convert JPG, JPEG and other images to PDF entirely in your browser. Combine multiple images into one PDF. No uploads, no servers — 100% private.',
		category: 'convert',
		relatedSlugs: ['png-to-pdf', 'pdf-to-jpg', 'merge-pdf']
	},
	{
		slug: 'pdf-to-jpg',
		name: 'PDF to JPG',
		description: 'Convert PDF pages to JPG images',
		icon: 'Image',
		keywords: ['pdf to jpg', 'pdf to image', 'pdf to jpeg', 'extract images from pdf'],
		metaTitle: 'Free PDF to JPG — Convert PDF to Images, No Upload',
		metaDescription:
			'Convert PDF pages to high-quality JPG images entirely in your browser. No uploads, no servers — your files never leave your device.',
		category: 'convert',
		relatedSlugs: ['pdf-to-png', 'jpg-to-pdf', 'split-pdf']
	},
	{
		slug: 'split-pdf',
		name: 'Split PDF',
		description: 'Extract pages or split into separate PDFs',
		icon: 'Scissors',
		keywords: ['split pdf', 'extract pages', 'separate pdf', 'pdf splitter'],
		metaTitle: 'Free Split PDF — Extract Pages, No Upload',
		metaDescription:
			'Split PDF files or extract specific pages entirely in your browser. No uploads, no servers — your files stay completely private.',
		category: 'organize',
		relatedSlugs: ['merge-pdf', 'reorder-pages', 'rotate-pdf']
	},
	{
		slug: 'rotate-pdf',
		name: 'Rotate PDF',
		description: 'Rotate PDF pages 90, 180 or 270 degrees',
		icon: 'RotateCw',
		keywords: ['rotate pdf', 'turn pdf', 'pdf rotation', 'flip pdf pages'],
		metaTitle: 'Free Rotate PDF — Rotate Pages Online, No Upload',
		metaDescription:
			'Rotate PDF pages 90, 180 or 270 degrees entirely in your browser. No uploads, no servers — your files never leave your device.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'reorder-pages', 'merge-pdf']
	},
	{
		slug: 'add-page-numbers',
		name: 'Add Page Numbers',
		description: 'Stamp page numbers on PDF pages',
		icon: 'Hash',
		keywords: ['add page numbers', 'pdf page numbers', 'number pdf pages', 'page numbering'],
		metaTitle: 'Free Add Page Numbers to PDF — No Upload, 100% in Browser',
		metaDescription:
			'Add page numbers to your PDF entirely in your browser. Choose position and format. No uploads, no servers — 100% private.',
		category: 'optimize',
		relatedSlugs: ['watermark-pdf', 'merge-pdf', 'rotate-pdf']
	},
	{
		slug: 'watermark-pdf',
		name: 'Watermark PDF',
		description: 'Add text or image watermark to PDF pages',
		icon: 'Stamp',
		keywords: ['watermark pdf', 'add watermark', 'pdf stamp', 'text watermark'],
		metaTitle: 'Free Watermark PDF — Add Watermark Online, No Upload',
		metaDescription:
			'Add text or image watermarks to your PDF entirely in your browser. No uploads, no servers — your documents stay private.',
		category: 'optimize',
		relatedSlugs: ['add-page-numbers', 'protect-pdf', 'merge-pdf']
	},
	{
		slug: 'pdf-to-png',
		name: 'PDF to PNG',
		description: 'Convert PDF pages to PNG images',
		icon: 'ImageDown',
		keywords: ['pdf to png', 'pdf to image', 'convert pdf to png', 'extract png from pdf'],
		metaTitle: 'Free PDF to PNG — Convert PDF to PNG Images, No Upload',
		metaDescription:
			'Convert PDF pages to high-quality PNG images entirely in your browser. No uploads, no servers — your files never leave your device.',
		category: 'convert',
		relatedSlugs: ['pdf-to-jpg', 'png-to-pdf', 'split-pdf']
	},
	{
		slug: 'png-to-pdf',
		name: 'PNG to PDF',
		description: 'Convert PNG images to a PDF document',
		icon: 'ImagePlus',
		keywords: ['png to pdf', 'image to pdf', 'convert png', 'photo to pdf'],
		metaTitle: 'Free PNG to PDF — Convert PNG to PDF, No Upload',
		metaDescription:
			'Convert PNG images to PDF entirely in your browser. Combine multiple images into one PDF. No uploads, no servers — 100% private.',
		category: 'convert',
		relatedSlugs: ['jpg-to-pdf', 'pdf-to-png', 'merge-pdf']
	},
	{
		slug: 'protect-pdf',
		name: 'Protect PDF',
		description: 'Add password encryption to your PDF',
		icon: 'Lock',
		keywords: ['protect pdf', 'encrypt pdf', 'password pdf', 'secure pdf'],
		metaTitle: 'Free Protect PDF — Add Password Encryption, No Upload',
		metaDescription:
			'Add password protection to your PDF entirely in your browser. No uploads, no servers — your files and passwords stay completely private.',
		category: 'security',
		relatedSlugs: ['unlock-pdf', 'watermark-pdf', 'merge-pdf']
	},
	{
		slug: 'unlock-pdf',
		name: 'Unlock PDF',
		description: 'Remove password from PDFs you own',
		icon: 'Unlock',
		keywords: ['unlock pdf', 'remove pdf password', 'decrypt pdf', 'unprotect pdf'],
		metaTitle: 'Free Unlock PDF — Remove Password Online, No Upload',
		metaDescription:
			'Remove password protection from PDFs you own entirely in your browser. No uploads, no servers — your files and passwords stay private.',
		category: 'security',
		relatedSlugs: ['protect-pdf', 'merge-pdf', 'compress-pdf']
	},
	{
		slug: 'reorder-pages',
		name: 'Reorder Pages',
		description: 'Drag and drop to rearrange PDF pages',
		icon: 'ArrowUpDown',
		keywords: ['reorder pdf pages', 'rearrange pdf', 'move pdf pages', 'sort pdf pages'],
		metaTitle: 'Free Reorder PDF Pages — Drag & Drop, No Upload',
		metaDescription:
			'Rearrange PDF pages with drag-and-drop entirely in your browser. No uploads, no servers — your files never leave your device.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'merge-pdf', 'rotate-pdf']
	}
];

export function getToolBySlug(slug: string): Tool | undefined {
	return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string): Tool[] {
	const tool = getToolBySlug(slug);
	if (!tool) return [];
	return tool.relatedSlugs.map((s) => getToolBySlug(s)).filter((t): t is Tool => !!t);
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
	return tools.filter((t) => t.category === category);
}
