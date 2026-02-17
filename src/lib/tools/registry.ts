export interface FAQ {
	question: string;
	answer: string;
}

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
	faqs: FAQ[];
}

export const tools: Tool[] = [
	{
		slug: 'html-to-pdf',
		name: 'HTML to PDF',
		description: 'Convert HTML to PDF locally in your browser',
		icon: 'FileCode',
		keywords: [
			'html to pdf',
			'convert html to pdf',
			'html to pdf converter',
			'html converter online',
			'gemini infographic to pdf',
			'html2pdf online free',
			'client side pdf converter',
			'browser pdf converter'
		],
		metaTitle: 'Free HTML to PDF Converter — No Upload, 100% in Browser',
		metaDescription:
			'Convert HTML to PDF entirely in your browser. Optimized for Gemini infographics. No uploads, no servers, no tracking. Smart page fitting eliminates half-empty pages.',
		category: 'convert',
		relatedSlugs: ['merge-pdf', 'compress-pdf', 'jpg-to-pdf'],
		faqs: [
			{
				question: 'Is HTMLtoPDF really free?',
				answer:
					'Yes. HTMLtoPDF is completely free with no usage limits. The entire conversion runs in your browser — there are no servers to pay for.'
			},
			{
				question: 'Does my HTML get uploaded to a server?',
				answer:
					'No. HTMLtoPDF runs 100% in your browser. Your HTML never leaves your device. The conversion uses html2canvas and jsPDF — both are client-side JavaScript libraries.'
			},
			{
				question: 'Does it work with Google Gemini infographics?',
				answer:
					'Yes. HTMLtoPDF is specifically optimized for Gemini Canvas infographic HTML. It uses an iframe-based renderer that executes Tailwind CDN scripts, Chart.js, and loads Google Fonts — producing pixel-accurate PDFs.'
			},
			{
				question: 'Why do other converters produce half-empty pages?',
				answer:
					'Most converters slice content at a fixed A4 height, leaving the last page partially empty. HTMLtoPDF measures the actual content height and adapts the page dimensions so every page is completely filled.'
			}
		]
	},
	{
		slug: 'merge-pdf',
		name: 'Merge PDF',
		description: 'Combine multiple PDFs into one document',
		icon: 'FilePlus2',
		keywords: [
			'merge pdf',
			'combine pdf',
			'join pdf',
			'pdf merger',
			'merge pdf files online free',
			'combine pdf files into one',
			'join pdf files together',
			'merge pdf without upload'
		],
		metaTitle: 'Free Merge PDF — Combine PDFs Online, No Upload',
		metaDescription:
			'Merge multiple PDF files into one document entirely in your browser. Drag, drop, reorder and combine. No uploads, no servers — 100% private.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'reorder-pages', 'compress-pdf'],
		faqs: [
			{
				question: 'How do I merge PDF files without uploading them?',
				answer:
					'Drop your PDF files into HTMLtoPDF.pro, reorder them as needed, and click Merge. The entire process runs in your browser using pdf-lib — your files never leave your device.'
			},
			{
				question: 'Is there a limit on how many PDFs I can merge?',
				answer:
					'There is no artificial limit. You can merge as many PDFs as your browser memory allows. Since processing happens locally, there are no server-side file size restrictions.'
			},
			{
				question: 'Can I reorder PDFs before merging?',
				answer:
					'Yes. After adding your files, use the up/down arrows to arrange them in the order you want. The final merged document follows your chosen order.'
			}
		]
	},
	{
		slug: 'compress-pdf',
		name: 'Compress PDF',
		description: 'Reduce PDF file size without losing quality',
		icon: 'FileDown',
		keywords: [
			'compress pdf',
			'reduce pdf size',
			'shrink pdf',
			'pdf compressor',
			'compress pdf online free',
			'reduce pdf file size',
			'make pdf smaller',
			'pdf size reducer'
		],
		metaTitle: 'Free Compress PDF — Reduce File Size, No Upload',
		metaDescription:
			'Compress PDF files in your browser by downscaling images and removing metadata. Adjust quality to balance size and clarity. No uploads, no servers — your files stay on your device.',
		category: 'optimize',
		relatedSlugs: ['merge-pdf', 'split-pdf', 'jpg-to-pdf'],
		faqs: [
			{
				question: 'How does browser-based PDF compression work?',
				answer:
					'Each page of your PDF is rendered to a canvas using PDF.js, then re-encoded as a JPEG at your chosen quality level. The compressed images are assembled into a new, smaller PDF — all in your browser.'
			},
			{
				question: 'Will compressing reduce the quality of my PDF?',
				answer:
					'You control the quality with a slider. Higher quality (80-95%) preserves most visual detail with moderate compression. Lower quality (30-50%) produces smaller files with some visible artifacts.'
			},
			{
				question: 'Is my PDF uploaded to a server during compression?',
				answer:
					'No. HTMLtoPDF.pro is the only PDF compressor that processes files 100% client-side. Your documents never leave your device.'
			}
		]
	},
	{
		slug: 'jpg-to-pdf',
		name: 'JPG to PDF',
		description: 'Convert images to a PDF document',
		icon: 'ImagePlus',
		keywords: [
			'jpg to pdf',
			'image to pdf',
			'jpeg to pdf',
			'photo to pdf',
			'convert jpg to pdf',
			'jpg to pdf converter online free',
			'multiple images to pdf',
			'picture to pdf'
		],
		metaTitle: 'Free JPG to PDF — Convert Images to PDF, No Upload',
		metaDescription:
			'Convert JPG, JPEG and other images to PDF entirely in your browser. Combine multiple images into one PDF. No uploads, no servers — 100% private.',
		category: 'convert',
		relatedSlugs: ['png-to-pdf', 'pdf-to-jpg', 'merge-pdf'],
		faqs: [
			{
				question: 'Can I convert multiple images to a single PDF?',
				answer:
					'Yes. Add as many images as you need, reorder them, and they will be combined into a single PDF document with one image per page.'
			},
			{
				question: 'What image formats are supported?',
				answer:
					'JPG, JPEG, PNG, WebP, GIF, and BMP. Non-JPG/PNG formats are automatically converted for PDF compatibility.'
			},
			{
				question: 'Does converting to PDF reduce image quality?',
				answer:
					'No. Images are embedded at their original resolution. There is no compression or quality loss — the PDF preserves your original image quality.'
			}
		]
	},
	{
		slug: 'pdf-to-jpg',
		name: 'PDF to JPG',
		description: 'Convert PDF pages to JPG images',
		icon: 'Image',
		keywords: [
			'pdf to jpg',
			'pdf to image',
			'pdf to jpeg',
			'extract images from pdf',
			'convert pdf to jpg',
			'pdf to jpg converter online free',
			'pdf page to image',
			'save pdf as jpg'
		],
		metaTitle: 'Free PDF to JPG — Convert PDF to Images, No Upload',
		metaDescription:
			'Convert PDF pages to high-quality JPG images entirely in your browser. Adjustable resolution. No uploads, no servers — your files never leave your device.',
		category: 'convert',
		relatedSlugs: ['pdf-to-png', 'jpg-to-pdf', 'split-pdf'],
		faqs: [
			{
				question: 'How do I convert a PDF to JPG without uploading?',
				answer:
					'Drop your PDF into HTMLtoPDF.pro, choose your resolution, and click Convert. Each page is rendered as a JPG image using PDF.js entirely in your browser.'
			},
			{
				question: 'Can I control the output image quality?',
				answer:
					'Yes. Use the resolution slider to choose between 1x (fast, smaller files) and 4x (high resolution, sharp images). The default 2x works well for most use cases.'
			},
			{
				question: 'Can I download all pages at once?',
				answer:
					'Yes. After conversion, click "Download all" to save every page as a separate JPG file, or click individual pages to download them one by one.'
			}
		]
	},
	{
		slug: 'split-pdf',
		name: 'Split PDF',
		description: 'Extract pages or split into separate PDFs',
		icon: 'Scissors',
		keywords: [
			'split pdf',
			'extract pages from pdf',
			'separate pdf pages',
			'pdf splitter',
			'split pdf online free',
			'extract pdf pages',
			'split pdf into individual pages',
			'pdf page extractor'
		],
		metaTitle: 'Free Split PDF — Extract Pages, No Upload',
		metaDescription:
			'Split PDF files or extract specific pages entirely in your browser. Choose page ranges or split every page. No uploads, no servers — your files stay completely private.',
		category: 'organize',
		relatedSlugs: ['merge-pdf', 'reorder-pages', 'rotate-pdf'],
		faqs: [
			{
				question: 'Can I extract specific pages from a PDF?',
				answer:
					'Yes. Enter page ranges like "1-3, 5, 8-10" to extract exactly the pages you need into a new PDF.'
			},
			{
				question: 'Can I split every page into a separate PDF?',
				answer:
					'Yes. Choose "Split all pages" mode and each page will be downloaded as its own individual PDF file.'
			},
			{
				question: 'Is there a page limit for splitting?',
				answer:
					'No artificial limit. Since all processing happens in your browser, you can split PDFs with as many pages as your browser memory supports.'
			}
		]
	},
	{
		slug: 'rotate-pdf',
		name: 'Rotate PDF',
		description: 'Rotate PDF pages 90, 180 or 270 degrees',
		icon: 'RotateCw',
		keywords: [
			'rotate pdf',
			'turn pdf',
			'pdf rotation',
			'flip pdf pages',
			'rotate pdf online free',
			'rotate pdf pages',
			'turn pdf sideways',
			'fix pdf orientation'
		],
		metaTitle: 'Free Rotate PDF — Rotate Pages Online, No Upload',
		metaDescription:
			'Rotate PDF pages 90, 180 or 270 degrees entirely in your browser. Fix sideways scans and landscape pages. No uploads, no servers — your files never leave your device.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'reorder-pages', 'merge-pdf'],
		faqs: [
			{
				question: 'How do I rotate a PDF that is sideways?',
				answer:
					'Upload your PDF, select 90° rotation, and click Rotate. The corrected PDF downloads instantly — all processing happens in your browser.'
			},
			{
				question: 'Can I rotate individual pages?',
				answer:
					'Currently, rotation applies to all pages at once. For individual page rotation, use the Reorder Pages tool which lets you manipulate pages individually.'
			},
			{
				question: 'Does rotating change the PDF quality?',
				answer:
					'No. Rotation is a lossless operation — it changes the page orientation metadata without re-rendering or compressing your content.'
			}
		]
	},
	{
		slug: 'add-page-numbers',
		name: 'Add Page Numbers',
		description: 'Stamp page numbers on PDF pages',
		icon: 'Hash',
		keywords: [
			'add page numbers to pdf',
			'pdf page numbers',
			'number pdf pages',
			'page numbering pdf',
			'add page numbers online free',
			'stamp page numbers',
			'pdf page numbering tool'
		],
		metaTitle: 'Free Add Page Numbers to PDF — No Upload, 100% in Browser',
		metaDescription:
			'Add page numbers to your PDF entirely in your browser. Choose position (left, center, right) and starting number. No uploads, no servers — 100% private.',
		category: 'optimize',
		relatedSlugs: ['watermark-pdf', 'merge-pdf', 'rotate-pdf'],
		faqs: [
			{
				question: 'Where can I place page numbers?',
				answer:
					'You can place page numbers at the bottom-left, bottom-center, or bottom-right of each page.'
			},
			{
				question: 'Can I start numbering from a specific page?',
				answer:
					'Yes. Set the starting number to any value. For example, start at 3 if your first two pages are a cover and table of contents.'
			},
			{
				question: 'Will adding page numbers change the existing content?',
				answer:
					'No. Page numbers are overlaid on top of the existing PDF content. The original text, images, and layout remain untouched.'
			}
		]
	},
	{
		slug: 'watermark-pdf',
		name: 'Watermark PDF',
		description: 'Add text or image watermark to PDF pages',
		icon: 'Stamp',
		keywords: [
			'watermark pdf',
			'add watermark to pdf',
			'pdf stamp',
			'text watermark pdf',
			'watermark pdf online free',
			'add watermark to pdf free',
			'pdf watermark tool',
			'stamp pdf with text'
		],
		metaTitle: 'Free Watermark PDF — Add Watermark Online, No Upload',
		metaDescription:
			'Add text or image watermarks to your PDF entirely in your browser. Customize text, opacity, and size. No uploads, no servers — your documents stay private.',
		category: 'optimize',
		relatedSlugs: ['add-page-numbers', 'protect-pdf', 'merge-pdf'],
		faqs: [
			{
				question: 'Can I customize the watermark appearance?',
				answer:
					'Yes. You can set the watermark text, adjust opacity (5-50%), and change the font size (20-120px). The watermark is placed diagonally across each page.'
			},
			{
				question: 'Is the watermark applied to every page?',
				answer:
					'Yes. The watermark is stamped on every page of your PDF document for consistent protection.'
			},
			{
				question: 'Can someone remove the watermark?',
				answer:
					'The watermark is embedded directly into the PDF page content. While not impossible to remove with specialized tools, it provides a strong visual deterrent for document protection.'
			}
		]
	},
	{
		slug: 'pdf-to-png',
		name: 'PDF to PNG',
		description: 'Convert PDF pages to PNG images',
		icon: 'ImageDown',
		keywords: [
			'pdf to png',
			'pdf to image',
			'convert pdf to png',
			'extract png from pdf',
			'pdf to png converter online free',
			'pdf page to png',
			'save pdf as png',
			'pdf to transparent png'
		],
		metaTitle: 'Free PDF to PNG — Convert PDF to PNG Images, No Upload',
		metaDescription:
			'Convert PDF pages to high-quality PNG images with transparency support, entirely in your browser. No uploads, no servers — your files never leave your device.',
		category: 'convert',
		relatedSlugs: ['pdf-to-jpg', 'png-to-pdf', 'split-pdf'],
		faqs: [
			{
				question: 'What is the difference between PDF to JPG and PDF to PNG?',
				answer:
					'PNG preserves transparency and produces sharper text with lossless compression. JPG produces smaller files but with slight compression artifacts. Use PNG for crisp text and graphics, JPG for photos.'
			},
			{
				question: 'Can I adjust the PNG output resolution?',
				answer:
					'Yes. Use the resolution slider to choose between 1x (fast) and 4x (ultra-high resolution). Higher resolution produces larger files but sharper images.'
			},
			{
				question: 'Are the PNG files transparent?',
				answer:
					'If your PDF pages have transparent backgrounds, the PNG output will preserve that transparency. Most PDFs have white backgrounds, which will appear as white in the PNG.'
			}
		]
	},
	{
		slug: 'png-to-pdf',
		name: 'PNG to PDF',
		description: 'Convert PNG images to a PDF document',
		icon: 'ImagePlus',
		keywords: [
			'png to pdf',
			'image to pdf',
			'convert png to pdf',
			'photo to pdf',
			'png to pdf converter online free',
			'multiple png to pdf',
			'combine png to pdf'
		],
		metaTitle: 'Free PNG to PDF — Convert PNG to PDF, No Upload',
		metaDescription:
			'Convert PNG images to PDF entirely in your browser. Combine multiple PNG files into one PDF with transparency preserved. No uploads, no servers — 100% private.',
		category: 'convert',
		relatedSlugs: ['jpg-to-pdf', 'pdf-to-png', 'merge-pdf'],
		faqs: [
			{
				question: 'Does PNG to PDF preserve transparency?',
				answer:
					'Yes. PNG transparency is preserved when embedded into the PDF document. Transparent areas remain transparent in the output.'
			},
			{
				question: 'Can I combine multiple PNGs into one PDF?',
				answer:
					'Yes. Add as many PNG images as you need, reorder them, and they will be combined into a single PDF with one image per page.'
			},
			{
				question: 'What is the maximum image size supported?',
				answer:
					'There is no artificial limit. The maximum size depends on your browser memory. Modern browsers can handle images up to several hundred megabytes.'
			}
		]
	},
	{
		slug: 'protect-pdf',
		name: 'Protect PDF',
		description: 'Add password encryption to your PDF',
		icon: 'Lock',
		keywords: [
			'protect pdf',
			'encrypt pdf',
			'password pdf',
			'secure pdf',
			'password protect pdf online free',
			'add password to pdf',
			'encrypt pdf online',
			'lock pdf with password'
		],
		metaTitle: 'Free Protect PDF — Add Password Encryption, No Upload',
		metaDescription:
			'Add password protection to your PDF entirely in your browser. Your password never leaves your device. No uploads, no servers — complete privacy for sensitive documents.',
		category: 'security',
		relatedSlugs: ['unlock-pdf', 'watermark-pdf', 'merge-pdf'],
		faqs: [
			{
				question: 'Is my password sent to a server?',
				answer:
					'No. Your password is processed entirely in your browser. It never leaves your device — HTMLtoPDF.pro has no server to send it to.'
			},
			{
				question: 'How secure is the PDF encryption?',
				answer:
					'The PDF is encrypted using the standard PDF encryption specification. The security depends on the strength of your chosen password.'
			},
			{
				question: 'Can I remove the password later?',
				answer:
					'Yes. Use the Unlock PDF tool on HTMLtoPDF.pro to remove the password from your protected PDF. You will need to enter the current password.'
			}
		]
	},
	{
		slug: 'unlock-pdf',
		name: 'Unlock PDF',
		description: 'Remove password from PDFs you own',
		icon: 'Unlock',
		keywords: [
			'unlock pdf',
			'remove pdf password',
			'decrypt pdf',
			'unprotect pdf',
			'unlock pdf online free',
			'remove password from pdf',
			'pdf password remover',
			'open locked pdf'
		],
		metaTitle: 'Free Unlock PDF — Remove Password Online, No Upload',
		metaDescription:
			'Remove password protection from PDFs you own, entirely in your browser. Enter the current password and download an unlocked copy. No uploads, no servers — your files and passwords stay private.',
		category: 'security',
		relatedSlugs: ['protect-pdf', 'merge-pdf', 'compress-pdf'],
		faqs: [
			{
				question: 'Can I unlock a PDF without knowing the password?',
				answer:
					'Some PDFs with only permission-level restrictions (print/copy disabled) can be unlocked without a password. PDFs with user-level password encryption require the correct password.'
			},
			{
				question: 'Is my password safe when unlocking?',
				answer:
					'Yes. Your password is processed entirely in your browser. It is never sent to any server — HTMLtoPDF.pro operates 100% client-side.'
			},
			{
				question: 'Is it legal to unlock a PDF?',
				answer:
					'You should only unlock PDFs that you own or have authorization to access. HTMLtoPDF.pro is designed for legitimate use cases such as removing your own passwords from documents.'
			}
		]
	},
	{
		slug: 'docx-to-pdf',
		name: 'DOCX to PDF',
		description: 'Convert Word documents to PDF',
		icon: 'FileText',
		keywords: [
			'docx to pdf',
			'word to pdf',
			'convert word to pdf',
			'doc to pdf',
			'docx to pdf converter online free',
			'word document to pdf',
			'convert docx to pdf free',
			'microsoft word to pdf'
		],
		metaTitle: 'Free DOCX to PDF — Convert Word to PDF, No Upload',
		metaDescription:
			'Convert Word documents (.docx) to PDF entirely in your browser. Preserves headings, lists, tables and formatting. No uploads, no servers — your documents stay private.',
		category: 'convert',
		relatedSlugs: ['pdf-to-docx', 'html-to-pdf', 'merge-pdf'],
		faqs: [
			{
				question: 'How does browser-based DOCX to PDF conversion work?',
				answer:
					'The DOCX file is parsed client-side using mammoth.js, which converts it to HTML preserving headings, lists, tables, bold, italic, and images. The HTML is then rendered and captured as a PDF — all in your browser.'
			},
			{
				question: 'Does it preserve formatting from my Word document?',
				answer:
					'Yes. Headings, paragraphs, bold, italic, underline, lists, tables, and embedded images are preserved. Complex features like headers/footers, columns, and macros are not supported.'
			},
			{
				question: 'Is my document uploaded to a server?',
				answer:
					'No. The entire conversion runs in your browser using client-side JavaScript. Your document never leaves your device.'
			},
			{
				question: 'What file formats are supported?',
				answer:
					'The tool accepts .docx files (the modern Word format used by Microsoft Word 2007 and later). Older .doc files are not supported.'
			}
		]
	},
	{
		slug: 'pdf-to-docx',
		name: 'PDF to DOCX',
		description: 'Convert PDF to editable Word document',
		icon: 'FileOutput',
		keywords: [
			'pdf to docx',
			'pdf to word',
			'convert pdf to word',
			'pdf to doc',
			'pdf to docx converter online free',
			'pdf to word document',
			'convert pdf to docx free',
			'pdf to editable word'
		],
		metaTitle: 'Free PDF to DOCX — Convert PDF to Word, No Upload',
		metaDescription:
			'Convert PDF files to editable Word documents (.docx) entirely in your browser. Extracts text with page structure preserved. No uploads, no servers — your files stay private.',
		category: 'convert',
		relatedSlugs: ['docx-to-pdf', 'pdf-to-jpg', 'split-pdf'],
		faqs: [
			{
				question: 'How does browser-based PDF to Word conversion work?',
				answer:
					'The PDF is parsed using PDF.js to extract text content from each page. The text is then structured into paragraphs and assembled into a .docx file using the docx library — all in your browser.'
			},
			{
				question: 'Does it preserve the original PDF formatting?',
				answer:
					'The tool extracts text content and preserves paragraph structure. Basic text layout is maintained, but complex formatting like columns, tables, and embedded images may not be preserved exactly as they appear in the PDF.'
			},
			{
				question: 'Can it convert scanned PDFs?',
				answer:
					'No. This tool extracts embedded text from PDFs. Scanned documents that contain only images require OCR (optical character recognition), which is not yet available.'
			},
			{
				question: 'Is my PDF uploaded to a server?',
				answer:
					'No. Everything runs in your browser. Your PDF and the resulting DOCX file never leave your device.'
			}
		]
	},
	{
		slug: 'reorder-pages',
		name: 'Reorder Pages',
		description: 'Drag and drop to rearrange PDF pages',
		icon: 'ArrowUpDown',
		keywords: [
			'reorder pdf pages',
			'rearrange pdf',
			'move pdf pages',
			'sort pdf pages',
			'reorder pdf pages online free',
			'rearrange pdf pages',
			'change pdf page order',
			'drag and drop pdf pages'
		],
		metaTitle: 'Free Reorder PDF Pages — Drag & Drop, No Upload',
		metaDescription:
			'Rearrange PDF pages with visual drag-and-drop entirely in your browser. See thumbnails, drag to reorder, save. No uploads, no servers — your files never leave your device.',
		category: 'organize',
		relatedSlugs: ['split-pdf', 'merge-pdf', 'rotate-pdf'],
		faqs: [
			{
				question: 'How do I rearrange pages in a PDF?',
				answer:
					'Upload your PDF, see thumbnails of each page, then drag them into your desired order or use the arrow buttons. Click "Save Reordered PDF" to download the result.'
			},
			{
				question: 'Can I see previews of the pages before reordering?',
				answer:
					'Yes. When you upload a PDF, thumbnails of every page are generated so you can visually identify and rearrange them.'
			},
			{
				question: 'Does reordering change the page content?',
				answer:
					'No. Reordering only changes the sequence of pages. All page content, formatting, and quality remain exactly the same.'
			}
		]
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
