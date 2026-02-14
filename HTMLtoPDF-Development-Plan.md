# HTMLtoPDF — Development Plan

**A 100% browser-side HTML-to-PDF converter. No servers. No API calls. Your data never leaves your device.**

---

## 1. Product Vision

HTMLtoPDF is a single-purpose web tool that converts HTML into PDF entirely within the user's browser. Zero backend. Zero telemetry. Zero data leaving the device. The entire conversion pipeline — parsing, rendering, and PDF generation — runs client-side using WebAssembly and JavaScript.

This is the core selling point: **absolute privacy by architecture, not by policy.**

Most HTML-to-PDF tools either upload your content to a server (Puppeteer/Playwright-based services) or require you to install desktop software. HTMLtoPDF eliminates both friction points. Open a URL, paste or drop your content, and get a PDF. Done.

### Target Users

Web developers who need quick PDF snapshots of markup. Content creators exporting blog drafts. QA engineers capturing rendered states. Anyone who doesn't want their HTML source touching a third-party server.

---

## 2. Core Architecture

### 2.1 Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **SvelteKit (Svelte 5)** | Compiled reactivity, tiny bundle, no virtual DOM overhead — ideal for a tool that should feel instant |
| UI Primitives | **Bits UI** | The Svelte ecosystem's answer to Radix Primitives — headless, accessible, unstyled components. Pairs with Tailwind for a Radix-like minimalist aesthetic |
| Styling | **Tailwind CSS v4** | Utility-first, zero runtime, pairs naturally with Bits UI for a shadcn-svelte-style design system |
| PDF Engine | **jsPDF + html2canvas** (via `html2pdf.js`) | Proven client-side pipeline. html2canvas rasterizes DOM to canvas, jsPDF converts canvas to PDF. No server dependency |
| HTML Parsing | **DOMParser API** (native browser) | Parses raw HTML strings into a DOM tree for sandboxed rendering. Zero dependencies |
| Deployment | **Static adapter** → Vercel/Cloudflare Pages/Netlify | SvelteKit static export. No server functions. Pure CDN-served static files |

### 2.2 Conversion Pipeline

```
User Input (paste / URL / file)
        │
        ▼
  ┌─────────────┐
  │ Input        │  Smart detection: URL regex → fetch via CORS proxy
  │ Resolver     │  HTML string → pass through
  │              │  File (.html) → FileReader API
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Sandboxed    │  Inject resolved HTML into a hidden <iframe>
  │ Renderer     │  with srcdoc attribute. Isolated DOM.
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ html2canvas  │  Rasterize the iframe's document body
  │              │  into an HTML5 Canvas element
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ jsPDF        │  Convert canvas image data into
  │              │  a multi-page PDF document
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ Blob URL     │  Generate downloadable PDF
  │ Download     │  via URL.createObjectURL()
  └─────────────┘
```

Every step runs in the browser's main thread or a Web Worker. Nothing leaves the device.

---

## 3. The Single Input — Design Philosophy

The UI has **one input**. Not three tabs. Not a dropdown to select mode. One unified field that behaves according to user intent.

### 3.1 Intent Detection Logic

```typescript
function detectInputType(value: string): 'url' | 'html' | 'empty' {
  const trimmed = value.trim();
  if (!trimmed) return 'empty';

  // URL detection: starts with http(s):// or www.
  const urlPattern = /^(https?:\/\/|www\.)/i;
  if (urlPattern.test(trimmed)) return 'url';

  // Everything else is treated as HTML
  return 'html';
}
```

File uploads are handled separately via drag-and-drop on the same input area or a subtle file picker icon. The input field doubles as a drop zone.

### 3.2 Input Behaviors

| User Action | Detected As | System Response |
|---|---|---|
| Pastes `https://example.com` | URL | Fetches page via CORS-safe proxy, renders in sandboxed iframe |
| Pastes `<div><h1>Hello</h1></div>` | HTML | Injects directly into sandboxed iframe for rendering |
| Pastes raw text without tags | HTML | Wraps in `<pre>` block, renders as-is |
| Drags `.html` file onto input | File | Reads via FileReader, feeds into HTML pipeline |
| Clicks the subtle upload icon | File | Opens native file picker, same flow |

### 3.3 UI Anatomy

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              HTMLtoPDF                               │
│              Your HTML → PDF. Locally. Privately.    │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │   Paste HTML, drop a file, or enter a URL     │  │  ← placeholder text
│  │                                               │  │
│  │                                               │  │  ← textarea / drop zone
│  │                                               │  │
│  │                                         📎    │  │  ← subtle file attach icon
│  └───────────────────────────────────────────────┘  │
│                                                     │
│              [ Convert to PDF ]                     │  ← single action button
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  🔒 100% local. Nothing leaves your browser.  │  │  ← trust signal
│  └───────────────────────────────────────────────┘  │
│                                                     │
│              sponsored by Fexr                      │
│              https://getfexr.com                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

That's it. No settings panel. No page size dropdown. No margin controls. Sensible defaults (A4, 10mm margins, 2x scale for clarity). Power users can eventually get an "Advanced" toggle, but v1 ships without it.

---

## 4. Implementation Plan

### Phase 1: Project Scaffold (Day 1)

**Goal:** Working SvelteKit project with Bits UI + Tailwind, deployed to a static host.

```bash
# Create SvelteKit project
npx sv create htmltopdf
# Select: Svelte 5, TypeScript, Tailwind CSS v4

cd htmltopdf

# Install core dependencies
npm install bits-ui                    # Radix-style headless primitives
npm install html2pdf.js                # Client-side HTML → PDF engine
npm install @lucide/svelte             # Minimal icon set (just the paperclip icon)

# Static adapter for zero-server deployment
npm install -D @sveltejs/adapter-static
```

Update `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
    })
  }
};
```

**Deliverable:** `npm run build` produces a static site that can be dragged onto any CDN.

---

### Phase 2: The Single Input Component (Day 1–2)

**Goal:** Build the unified input that auto-detects intent.

Create `src/lib/components/UnifiedInput.svelte`:

```svelte
<script lang="ts">
  import { Paperclip } from '@lucide/svelte';

  let inputValue = $state('');
  let isDragOver = $state(false);
  let fileInput: HTMLInputElement;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.html')) {
      readFile(file);
    }
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      inputValue = reader.result as string;
    };
    reader.readAsText(file);
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) readFile(file);
  }

  // Export the value for parent consumption
  export function getValue() { return inputValue; }
</script>

<div
  class="relative"
  class:ring-2={isDragOver}
  class:ring-neutral-400={isDragOver}
  ondragover={(e) => { e.preventDefault(); isDragOver = true; }}
  ondragleave={() => isDragOver = false}
  ondrop={handleDrop}
>
  <textarea
    bind:value={inputValue}
    placeholder="Paste HTML, drop a file, or enter a URL"
    rows="8"
    class="w-full resize-none rounded-lg border border-neutral-200
           bg-neutral-50 px-4 py-3 font-mono text-sm
           placeholder:text-neutral-400
           focus:border-neutral-400 focus:outline-none
           dark:border-neutral-800 dark:bg-neutral-900"
  />

  <button
    onclick={() => fileInput.click()}
    class="absolute bottom-3 right-3 text-neutral-400
           hover:text-neutral-600 transition-colors"
    aria-label="Upload HTML file"
  >
    <Paperclip size={18} />
  </button>

  <input
    bind:this={fileInput}
    type="file"
    accept=".html,.htm"
    class="hidden"
    onchange={handleFileSelect}
  />
</div>
```

Key decisions: monospace font for the textarea (signals "code input"), neutral color palette, no borders that scream "form field." The drop zone is invisible until you drag over it.

---

### Phase 3: Conversion Engine (Day 2–3)

**Goal:** Wire up the full HTML → PDF pipeline.

Create `src/lib/engine/converter.ts`:

```typescript
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

  // Create a sandboxed container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const blob = await html2pdf()
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
      // Use a public CORS proxy for URL fetching
      // In production, self-host a lightweight proxy or use allorigins
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(value.trim())}`;
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
```

**Important note on URL fetching:** Browsers block cross-origin requests. For v1, use a lightweight CORS proxy (`allorigins` or `corsproxy.io`). For production, self-host a minimal Cloudflare Worker that proxies the request — this is the only "server" component, and it never sees the PDF output, only fetches the public URL the user already typed in. The PDF generation itself remains 100% client-side.

---

### Phase 4: Main Page Assembly (Day 3–4)

**Goal:** Wire everything together into the single-page app.

`src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import UnifiedInput from '$lib/components/UnifiedInput.svelte';
  import { convertHtmlToPdf, resolveInput, detectInputType } from '$lib/engine/converter';

  let inputValue = $state('');
  let isConverting = $state(false);
  let error = $state('');

  async function handleConvert() {
    if (!inputValue.trim()) return;

    isConverting = true;
    error = '';

    try {
      const html = await resolveInput(inputValue);
      const blob = await convertHtmlToPdf(html);

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Conversion failed';
    } finally {
      isConverting = false;
    }
  }
</script>

<main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-20">

  <!-- Title -->
  <div class="mb-8 text-center">
    <h1 class="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
      HTMLtoPDF
    </h1>
    <p class="mt-1 text-sm text-neutral-500">
      Your HTML → PDF. Locally. Privately.
    </p>
  </div>

  <!-- Unified Input -->
  <UnifiedInput bind:value={inputValue} />

  <!-- Error -->
  {#if error}
    <p class="mt-2 text-sm text-red-500">{error}</p>
  {/if}

  <!-- Convert Button -->
  <button
    onclick={handleConvert}
    disabled={isConverting || !inputValue.trim()}
    class="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium
           text-white transition-colors
           hover:bg-neutral-800
           disabled:cursor-not-allowed disabled:opacity-40
           dark:bg-neutral-100 dark:text-neutral-900
           dark:hover:bg-neutral-200"
  >
    {isConverting ? 'Converting...' : 'Convert to PDF'}
  </button>

  <!-- Trust Signal -->
  <div class="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
    </svg>
    100% local. Nothing leaves your browser.
  </div>

  <!-- Sponsor -->
  <div class="mt-12 text-center text-xs text-neutral-400">
    sponsored by
    <a
      href="https://getfexr.com"
      target="_blank"
      rel="noopener noreferrer"
      class="underline underline-offset-2 hover:text-neutral-600 transition-colors"
    >
      Fexr
    </a>
  </div>

</main>
```

---

### Phase 5: Polish & Edge Cases (Day 4–5)

**5.1 Loading State**

Replace the button text with a minimal spinner animation during conversion. Use CSS `@keyframes` — no library needed.

```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  animation: spin 0.6s linear infinite;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  width: 16px;
  height: 16px;
}
```

**5.2 Large HTML Handling**

html2canvas has a canvas size limit (~16,384px in most browsers). For very long HTML documents, implement pagination: measure the rendered height, split into chunks, and render each chunk to a separate PDF page.

```typescript
// Pseudo-code for chunked rendering
const pageHeight = 297; // mm (A4)
const totalHeight = container.scrollHeight;
const pages = Math.ceil(totalHeight / (pageHeight * 3.78)); // px per mm

for (let i = 0; i < pages; i++) {
  // Scroll container to page offset
  // Capture visible viewport via html2canvas
  // Add as new page to jsPDF document
}
```

**5.3 Dark Mode**

Use `prefers-color-scheme` media query. Tailwind's `dark:` variants handle this automatically. The app respects the user's OS preference with no toggle needed.

**5.4 Keyboard Shortcuts**

`Ctrl/Cmd + Enter` triggers conversion. `Ctrl/Cmd + V` into the textarea auto-focuses and converts if the pasted content looks complete (has a closing `</html>` tag).

**5.5 Mobile Responsiveness**

The single-column layout with `max-w-xl` is inherently mobile-friendly. The textarea should have `min-h-[200px]` on mobile. The file upload icon becomes the primary input method on mobile (drag-and-drop doesn't work on touch devices).

---

### Phase 6: Performance Optimization (Day 5–6)

**6.1 Bundle Size**

html2pdf.js bundles html2canvas (~40KB gzipped) and jsPDF (~30KB gzipped). Total JS payload should be under 100KB gzipped for the entire app. SvelteKit's code splitting ensures the conversion library loads only when the user first clicks "Convert."

```typescript
// Lazy load the conversion engine
async function handleConvert() {
  const { convertHtmlToPdf } = await import('$lib/engine/converter');
  // ... proceed with conversion
}
```

**6.2 Web Worker Offloading (v2)**

Move html2canvas rendering to a Web Worker using OffscreenCanvas to keep the UI responsive during conversion. This is a v2 enhancement — v1 uses the main thread with a loading indicator.

**6.3 Static Prerendering**

SvelteKit's static adapter pre-renders the HTML shell at build time. The page loads instantly from CDN, and JavaScript hydrates the interactive elements. Time to interactive should be under 500ms on a 4G connection.

---

## 5. Deployment Strategy

### Static Export

```bash
npm run build
# Output: /build directory with index.html + JS/CSS assets
```

Deploy the `/build` folder to any static host. Recommended options: Cloudflare Pages (free, global CDN, fastest cold starts), Vercel (free tier, automatic SvelteKit detection), or Netlify (free tier, form handling if needed later). All three require zero server configuration for static sites.

### Custom Domain

Point your domain's DNS to the chosen host. Enable HTTPS (automatic on all three platforms). Set cache headers for immutable assets (`/_app/immutable/*` → `max-age=31536000`).

### CI/CD

GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3  # or equivalent
        with:
          command: pages deploy build
```

---

## 6. Privacy as Architecture

This section is both a technical specification and marketing copy — because in this product, they're the same thing.

### What "100% Local" Actually Means

The conversion pipeline is: `HTML string → DOMParser → hidden iframe (srcdoc) → html2canvas → Canvas → jsPDF → Blob → download`. Every API used — `DOMParser`, `html2canvas`, `jsPDF`, `URL.createObjectURL`, `Blob` — is a browser-native or client-side JavaScript API. No `fetch()` is called during conversion. No WebSocket. No beacon. No analytics pixel.

### The One Exception: URL Mode

When a user pastes a URL, the app needs to fetch that page's HTML. Browsers block this due to CORS. The minimal approach is a stateless CORS proxy (a Cloudflare Worker that adds `Access-Control-Allow-Origin: *` to the response headers). This proxy sees the URL but never sees the rendered PDF — it just passes through raw HTML. For maximum privacy, users can paste the HTML source directly (right-click → View Source → copy/paste), bypassing even this step.

### Trust Signals in the UI

The lock icon and "100% local" label are persistent, not hidden in a footer. The app's source code should be open on GitHub so users can verify the claim. The build pipeline should be reproducible — what's on GitHub is what's deployed.

---

## 7. File Structure

```
htmltopdf/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   └── UnifiedInput.svelte      # The single input component
│   │   ├── engine/
│   │   │   └── converter.ts             # html2pdf.js wrapper + input detection
│   │   └── styles/
│   │       └── app.css                  # Tailwind base + custom tokens
│   ├── routes/
│   │   ├── +layout.svelte               # Shell with dark mode + font loading
│   │   └── +page.svelte                 # The entire app UI
│   └── app.html                         # HTML shell with meta tags + OG
├── static/
│   ├── favicon.svg                      # Minimal monochrome icon
│   └── og.png                           # Open Graph image for social sharing
├── svelte.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

That's it. No `/api` routes. No `/server` directory. No database config. The entire app is six meaningful files.

---

## 8. Roadmap

### v1.0 — Ship It (Week 1)

Core conversion (paste HTML → get PDF), file upload, basic URL fetching, static deployment, mobile-responsive single-page layout. This is the launch version.

### v1.1 — Refinement (Week 2)

Preview pane (show rendered HTML before converting), keyboard shortcut (`Cmd+Enter`), toast notifications for success/error, improved error messages for malformed HTML.

### v1.2 — Power User Features (Week 3–4)

Collapsible "Advanced" section with: page size selector (A4/Letter/Legal), orientation toggle, margin control, filename input. All optional, all hidden by default. The default experience remains one input + one button.

### v2.0 — Performance (Month 2)

Web Worker offloading for conversion, OffscreenCanvas rendering, progress indicator for large documents, chunked pagination for documents exceeding canvas limits.

### v2.1 — Beyond HTML (Month 3)

Markdown-to-PDF (parse Markdown to HTML, then through the same pipeline), SVG-to-PDF, and a simple code-to-PDF formatter with syntax highlighting.

---

## 9. SEO & Growth

### Meta Tags (in `app.html`)

```html
<title>HTMLtoPDF — Convert HTML to PDF locally in your browser</title>
<meta name="description" content="Free, private HTML to PDF converter.
  Runs 100% in your browser. No uploads, no servers, no tracking." />
<meta property="og:title" content="HTMLtoPDF — 100% Local Conversion" />
<meta property="og:description" content="Paste HTML or a URL, get a PDF.
  Nothing leaves your browser." />
```

### Content Strategy

Publish a companion blog post: "Why Your HTML-to-PDF Tool Shouldn't Need a Server" — explaining the architecture and privacy benefits. Target long-tail keywords: "html to pdf converter online free no upload", "convert html to pdf locally", "client-side html to pdf javascript."

### Open Source

Open-source the project on GitHub. This serves dual purposes: trust verification (users can audit the "100% local" claim) and community contributions. Link to the repo from the app footer.

---

## 10. Sponsored by Fexr

<p align="center">
  <strong>Sponsored by <a href="https://getfexr.com">Fexr</a></strong><br/>
  <em>Algorithmic infrastructure for community-driven market intelligence.</em><br/>
  <a href="https://getfexr.com">getfexr.com</a>
</p>
