# HTMLtoPDF.pro

**PDF tools that run entirely in your browser.** No uploads. No servers. No accounts. No ads. Just open source code doing exactly what it says.

**[htmltopdf.pro](https://htmltopdf.pro)**

---

<img width="1512" height="982" alt="Screenshot 2026-02-17 at 23 41 21" src="https://github.com/user-attachments/assets/92daf3d2-3379-4c54-866c-35ee0faf56a6" />

---

## The problem

Every popular PDF tool — iLovePDF, Smallpdf, PDF2Go — uploads your files to their servers. Your contracts, tax documents, medical records, and private photos pass through third-party infrastructure you don't control. Then they show you ads and ask you to pay.

It doesn't have to work this way. Every single PDF operation these tools perform can run natively in a browser, in milliseconds, without touching a server.

That's what this project is.

---

## What's built so far

### Convert
| Tool | What it does |
|------|-------------|
| **HTML to PDF** | Converts HTML to PDF — actually executes scripts, loads fonts, renders Tailwind. Built for Gemini Canvas infographics. |
| **JPG to PDF** | One or more images → a single PDF |
| **PNG to PDF** | PNG → PDF with transparency preserved |
| **PDF to JPG** | PDF pages → high-quality JPG images |
| **PDF to PNG** | PDF pages → lossless PNG images |

### Organize
| Tool | What it does |
|------|-------------|
| **Merge PDF** | Combine multiple PDFs into one |
| **Split PDF** | Extract page ranges or split into individual files |
| **Rotate PDF** | Rotate pages 90, 180, or 270 degrees |
| **Reorder Pages** | Drag-and-drop page rearrangement with visual thumbnails |

### Optimize & Edit
| Tool | What it does |
|------|-------------|
| **Compress PDF** | Reduce file size with adjustable quality |
| **Add Page Numbers** | Stamp page numbers at any position |
| **Watermark PDF** | Diagonal text watermarks with custom opacity |

### Security
| Tool | What it does |
|------|-------------|
| **Protect PDF** | Add password encryption |
| **Unlock PDF** | Remove passwords from PDFs you own |

---

## How it works

Everything runs client-side. No `fetch()` during processing. No WebSockets. No telemetry. No cookies.

```
src/
├── app.html                    # Shell HTML
├── app.css                     # Tailwind v4 + custom animations
├── lib/
│   ├── tools/
│   │   └── registry.ts         # Single config drives nav, homepage, sitemap, cross-links, FAQs
│   ├── components/
│   │   ├── NavHeader.svelte
│   │   ├── Footer.svelte
│   │   ├── ToolPageLayout.svelte
│   │   ├── FileDropZone.svelte
│   │   ├── RelatedTools.svelte
│   │   └── UnifiedInput.svelte
│   └── engine/
│       └── converter.ts        # HTML-to-PDF rendering pipeline
└── routes/
    ├── +page.svelte            # Homepage
    ├── html-to-pdf/
    ├── merge-pdf/
    ├── compress-pdf/
    ├── jpg-to-pdf/
    ├── pdf-to-jpg/
    ├── split-pdf/
    ├── rotate-pdf/
    ├── add-page-numbers/
    ├── watermark-pdf/
    ├── pdf-to-png/
    ├── png-to-pdf/
    ├── protect-pdf/
    ├── unlock-pdf/
    └── reorder-pages/
```

### Adding a new tool takes about 30 minutes

1. Add an entry to `registry.ts` — name, slug, description, icon, related tools
2. Create `src/routes/your-tool/+page.svelte` — the tool logic lives here
3. That's it. Nav, homepage card, sitemap entry, and related tool links are all generated automatically.

### Libraries used

| Library | Used for |
|---------|----------|
| **pdf-lib** (~300 KB) | Merge, split, rotate, watermark, page numbers, compress, encrypt, reorder |
| **pdfjs-dist** (~800 KB, lazy) | PDF-to-image rendering, thumbnails |
| **html2canvas** (~53 KB) | Captures rendered iframes for HTML-to-PDF |
| **jsPDF** (~23 KB) | Assembles canvas frames into paginated PDF |

All libraries load on-demand — only the code needed for the active tool is downloaded.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | SvelteKit 2 + Svelte 5 (runes) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide Svelte |
| Deployment | GitHub Pages (fully static) |
| Build | Vite + adapter-static |

---

## What's missing

These are real gaps. If any of these sound interesting to you, the codebase is small enough that you can ship one in an afternoon:

- **PDF to Word / DOCX** — the hardest one, but most requested
- **Crop / trim pages** — set margins on existing PDF pages
- **Extract images from PDF** — pull embedded images out
- **Remove pages** — currently you split and then merge; should be one tool
- **PDF form fill** — fill out PDF forms in-browser
- **Dark mode** — the whole UI is light-only right now
- **Batch operations** — apply the same operation to many files at once
- **Mobile experience** — works but isn't optimized for small screens

---

## Getting started

```sh
git clone https://github.com/nidhinrubix/htmltopdf.pro
cd htmltopdf.pro
npm install
npm run dev       # localhost:5173
```

```sh
npm run build     # outputs to /build — a fully static site
npm run preview   # preview production build
```

---

## Contributing

The project is intentionally small and approachable. There's no test suite gatekeeping you, no complex build pipeline, and no abstraction layers to navigate before you can ship something real.

If you find a bug, open an issue. If you fix it, open a PR. If you want to build one of the missing tools above, just do it — the pattern is consistent across all 14 existing tools, so reading any one of them is enough to know what to do.

The only hard rule: **nothing should touch a server during file processing.** That's the whole point.

---

## License

MIT. Use it, fork it, build on it.

---

*Sponsored by [Fexr](https://getfexr.com) — agentic, anonymous market intelligence.*
