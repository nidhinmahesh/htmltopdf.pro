# HTMLtoPDF.pro — Free PDF Tools, 100% in Your Browser

**The only PDF toolkit that never touches your files.** Merge, compress, convert, split, rotate and protect PDFs entirely in your browser. No uploads, no servers, no tracking. Open source.

**[htmltopdf.pro](https://htmltopdf.pro)**

---

## Why This Exists

Every popular PDF tool — iLovePDF, Smallpdf, PDF2Go — uploads your files to their servers. Your contracts, tax documents, medical records, and private photos pass through third-party infrastructure you don't control.

HTMLtoPDF.pro eliminates this entirely. Every tool runs in your browser using client-side JavaScript. Your files never leave your device. There is no server to upload to, no account to create, no ads to endure, and no file size limits beyond your browser's memory.

---

## Tools (14)

### Convert
| Tool | Description | Route |
|------|-------------|-------|
| **HTML to PDF** | Convert HTML to PDF, optimized for Gemini infographics | [`/html-to-pdf`](https://htmltopdf.pro/html-to-pdf) |
| **JPG to PDF** | Convert one or more images to a single PDF | [`/jpg-to-pdf`](https://htmltopdf.pro/jpg-to-pdf) |
| **PNG to PDF** | Convert PNG images to PDF with transparency | [`/png-to-pdf`](https://htmltopdf.pro/png-to-pdf) |
| **PDF to JPG** | Render PDF pages as high-quality JPG images | [`/pdf-to-jpg`](https://htmltopdf.pro/pdf-to-jpg) |
| **PDF to PNG** | Render PDF pages as lossless PNG images | [`/pdf-to-png`](https://htmltopdf.pro/pdf-to-png) |

### Organize
| Tool | Description | Route |
|------|-------------|-------|
| **Merge PDF** | Combine multiple PDFs into one document | [`/merge-pdf`](https://htmltopdf.pro/merge-pdf) |
| **Split PDF** | Extract page ranges or split into individual PDFs | [`/split-pdf`](https://htmltopdf.pro/split-pdf) |
| **Rotate PDF** | Rotate pages 90, 180 or 270 degrees | [`/rotate-pdf`](https://htmltopdf.pro/rotate-pdf) |
| **Reorder Pages** | Visual drag-and-drop page rearrangement | [`/reorder-pages`](https://htmltopdf.pro/reorder-pages) |

### Optimize
| Tool | Description | Route |
|------|-------------|-------|
| **Compress PDF** | Reduce file size with adjustable quality | [`/compress-pdf`](https://htmltopdf.pro/compress-pdf) |
| **Add Page Numbers** | Stamp page numbers at customizable positions | [`/add-page-numbers`](https://htmltopdf.pro/add-page-numbers) |
| **Watermark PDF** | Add diagonal text watermarks with custom opacity | [`/watermark-pdf`](https://htmltopdf.pro/watermark-pdf) |

### Security
| Tool | Description | Route |
|------|-------------|-------|
| **Protect PDF** | Add password encryption | [`/protect-pdf`](https://htmltopdf.pro/protect-pdf) |
| **Unlock PDF** | Remove password from PDFs you own | [`/unlock-pdf`](https://htmltopdf.pro/unlock-pdf) |

---

## Architecture

```
src/
├── app.html                    # Shell HTML with site-wide SEO + structured data
├── app.css                     # Tailwind v4 + custom animations
├── lib/
│   ├── tools/
│   │   └── registry.ts         # Central tool config: metadata, SEO, FAQs, cross-links
│   ├── components/
│   │   ├── NavHeader.svelte    # Top nav with tool links + mobile menu
│   │   ├── Footer.svelte       # Privacy badge, GitHub, sponsor
│   │   ├── ToolPageLayout.svelte  # Standard tool page: SEO head, breadcrumb, FAQs
│   │   ├── FileDropZone.svelte # Drag-drop zone for PDF/image files
│   │   ├── RelatedTools.svelte # Cross-link grid at bottom of tool pages
│   │   └── UnifiedInput.svelte # HTML/file/URL input for HTML-to-PDF
│   └── engine/
│       └── converter.ts        # HTML-to-PDF rendering pipeline
└── routes/
    ├── +page.svelte            # Homepage: tool hub with card grid + SEO article
    ├── +layout.svelte          # Shared nav + footer wrapper
    ├── +layout.ts              # Prerender + SSR config
    ├── sitemap.xml/+server.ts  # Dynamic sitemap from tool registry
    ├── html-to-pdf/            # HTML → PDF (iframe + html2canvas + jsPDF)
    ├── merge-pdf/              # Combine PDFs (pdf-lib)
    ├── compress-pdf/           # Reduce size (PDF.js + canvas + pdf-lib)
    ├── jpg-to-pdf/             # Images → PDF (pdf-lib)
    ├── pdf-to-jpg/             # PDF → JPG images (PDF.js)
    ├── split-pdf/              # Extract/split pages (pdf-lib)
    ├── rotate-pdf/             # Rotate pages (pdf-lib)
    ├── add-page-numbers/       # Stamp page numbers (pdf-lib)
    ├── watermark-pdf/          # Text watermark (pdf-lib)
    ├── pdf-to-png/             # PDF → PNG images (PDF.js)
    ├── png-to-pdf/             # PNG → PDF (pdf-lib)
    ├── protect-pdf/            # Password encryption (pdf-lib)
    ├── unlock-pdf/             # Password removal (pdf-lib)
    └── reorder-pages/          # Visual page reorder (PDF.js + pdf-lib)
```

### Tool Registry

Every tool is defined in `src/lib/tools/registry.ts`. A single config object drives:

- **Navigation** — NavHeader renders links from the registry
- **Homepage** — Card grid generated from the registry
- **Sitemap** — `sitemap.xml` endpoint iterates the registry at build time
- **Cross-linking** — `relatedSlugs` creates internal link graphs between tools
- **Per-page SEO** — `metaTitle`, `metaDescription`, `keywords` populate `<svelte:head>`
- **Structured data** — WebApplication, FAQPage, and BreadcrumbList schemas per page
- **FAQ sections** — Each tool has 3-4 FAQs rendered as accordions + FAQ schema

### Processing Pipeline

All PDF operations run client-side:

| Library | Size | Used by |
|---------|------|---------|
| **pdf-lib** | ~300 KB | Merge, split, rotate, watermark, page numbers, compress, encrypt, reorder |
| **pdfjs-dist** (PDF.js) | ~800 KB, lazy-loaded | PDF-to-image rendering, compression, page reorder thumbnails |
| **html2canvas** | ~53 KB | HTML-to-PDF (captures rendered iframes) |
| **jsPDF** | ~23 KB | HTML-to-PDF (assembles canvas into paginated PDF) |

All libraries are loaded on-demand via dynamic `import()` — only the code needed for the active tool is downloaded.

---

## SEO

Every page is optimized for search:

- **Per-tool `<svelte:head>`** with unique title, description, keywords, canonical URL, Open Graph, and Twitter Card tags
- **WebApplication schema** per tool for rich results
- **FAQPage schema** per tool for FAQ rich snippets in search
- **BreadcrumbList schema** per tool for breadcrumb display in search
- **Organization schema** site-wide
- **Dynamic `sitemap.xml`** generated from the tool registry at build time (15 URLs)
- **Visible breadcrumbs** on each tool page
- **Internal cross-linking** via Related Tools grid and navigation
- **Long-form SEO content** on homepage with comparison table, FAQ, and use cases
- **Visible FAQ accordions** on every tool page (matching FAQ schema)

### Target Keywords

| Tool | Primary keyword | Monthly search volume |
|------|----------------|----------------------|
| Merge PDF | "merge pdf" | ~1.2M |
| Compress PDF | "compress pdf" | ~1M |
| JPG to PDF | "jpg to pdf" | ~800K |
| PDF to JPG | "pdf to jpg" | ~700K |
| Split PDF | "split pdf" | ~400K |
| Rotate PDF | "rotate pdf" | ~300K |
| Add Page Numbers | "add page numbers to pdf" | ~50K |
| Watermark PDF | "watermark pdf" | ~40K |

Each tool page targets its primary keyword plus long-tail modifiers: "free", "online", "no upload", "private", "without uploading".

---

## Differentiators

| Feature | iLovePDF | Smallpdf | PDF2Go | HTMLtoPDF.pro |
|---------|----------|----------|--------|---------------|
| File privacy | Server upload | Server upload | Server upload | **100% browser** |
| Ads | Yes | Yes | Yes | **None** |
| Sign-up | Required for batch | After 2 tasks | Required | **Never** |
| Price | Freemium | Freemium | Freemium | **Free forever** |
| File size limit | 100 MB | Limited | 100 MB | **Browser memory only** |
| Open source | No | No | No | **Yes** |
| Works offline | No | No | No | **Yes (after load)** |
| Tracking | Yes | Yes | Yes | **None** |

**Positioning**: "The only PDF toolkit that never touches your files."

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **SvelteKit 2 + Svelte 5** | Compiled reactivity, tiny bundle, runes syntax |
| Styling | **Tailwind CSS v4** | Utility-first, zero runtime, Vite plugin |
| Icons | **Lucide Svelte** | Tree-shakeable icon library |
| PDF manipulation | **pdf-lib** | Create, merge, split, rotate, watermark, encrypt |
| PDF rendering | **pdfjs-dist** | Mozilla's client-side PDF renderer |
| HTML capture | **html2canvas + jsPDF** | DOM-to-canvas-to-PDF pipeline |
| Deployment | **GitHub Pages** | Static site, CDN-served |
| Build | **Vite + adapter-static** | Pre-rendered HTML per route |

---

## HTML-to-PDF: Gemini Infographic Engine

The HTML-to-PDF tool includes a specialized rendering pipeline for Gemini Canvas infographics:

1. **Input detection** — auto-detects raw HTML, `.html` files, or URLs
2. **Iframe rendering** — loads HTML via `srcdoc` so the browser executes all `<script>` tags (Tailwind CDN, Chart.js), loads fonts, and processes CSS
3. **Resource waiting** — waits for `document.fonts.ready`, image loads, and a settling delay for async scripts
4. **Canvas capture** — `html2canvas` rasterizes the fully rendered DOM
5. **Smart page fitting** — adapts PDF page height to content so every page is completely filled, no half-empty endings
6. **Download** — PDF delivered via `URL.createObjectURL()`

This solves the critical problem with Gemini infographics: standard converters inject HTML as static markup without executing scripts, so Tailwind classes are ignored, Chart.js canvases stay blank, and fonts fall back to defaults.

---

## Privacy

Every tool's processing pipeline is browser-native:

- **PDF tools**: `File → ArrayBuffer → pdf-lib / PDF.js → Blob → download`
- **Image tools**: `File → Canvas → pdf-lib / Blob → download`
- **HTML tool**: `HTML → iframe → html2canvas → jsPDF → Blob → download`

No `fetch()` during processing. No WebSocket. No telemetry. No cookies. No analytics.

**One exception**: the HTML-to-PDF URL mode fetches pages via a public CORS proxy (`allorigins`). The proxy sees the URL but never the PDF. To avoid even this, paste the HTML source directly.

---

## Development

```sh
npm install
npm run dev       # development server at localhost:5173
```

## Build

```sh
npm run build     # outputs to /build
npm run preview   # preview production build locally
```

The `/build` directory is a fully static site. Deploy to GitHub Pages, Cloudflare Pages, Vercel, Netlify, or any CDN.

---

## Sponsored by Fexr

**[Fexr](https://getfexr.com)** — Algorithmic infrastructure for community-driven market intelligence.

---

## License

Open source. Contributions welcome.
