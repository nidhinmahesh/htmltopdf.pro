// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module 'html2pdf.js' {
	interface Html2PdfOptions {
		margin?: number;
		filename?: string;
		image?: { type: string; quality: number };
		html2canvas?: Record<string, unknown>;
		jsPDF?: Record<string, unknown>;
	}

	interface Html2PdfWorker {
		set(options: Html2PdfOptions): Html2PdfWorker;
		from(element: HTMLElement | string): Html2PdfWorker;
		outputPdf(type: string): Promise<Blob>;
		save(): Promise<void>;
	}

	function html2pdf(): Html2PdfWorker;
	export default html2pdf;
}

export {};
