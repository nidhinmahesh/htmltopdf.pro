/**
 * Google Ads conversion tracking — opt-in only.
 *
 * HTMLtoPDF.pro is open source and runs with zero tracking by default.
 * This module loads Google's gtag.js ONLY when a Google Ads ID is configured.
 * If GOOGLE_ADS_ID is empty, no external scripts are loaded and no data leaves the browser.
 *
 * Self-hosters and forks: leave GOOGLE_ADS_ID empty for a fully offline, tracking-free experience.
 */

// ── Configuration ────────────────────────────────────────────────────
// Set your Google Ads Conversion ID (e.g. 'AW-1234567890')
// Leave empty to disable all ad tracking.
export const GOOGLE_ADS_ID = '';

// Set your conversion label from Google Ads (e.g. 'AbCdEfGhIjKlMnOp')
export const GOOGLE_ADS_CONVERSION_LABEL = '';
// ─────────────────────────────────────────────────────────────────────

declare global {
	interface Window {
		dataLayer: unknown[];
		gtag: (...args: unknown[]) => void;
	}
}

/**
 * Initialize gtag.js for Google Ads page-view tracking.
 * Call once from the root layout's onMount.
 * Does nothing if GOOGLE_ADS_ID is not set.
 */
export function initGtag(): void {
	if (!GOOGLE_ADS_ID || typeof window === 'undefined') return;

	window.dataLayer = window.dataLayer || [];
	window.gtag = function () {
		// eslint-disable-next-line prefer-rest-params
		window.dataLayer.push(arguments);
	};
	window.gtag('js', new Date());
	window.gtag('config', GOOGLE_ADS_ID);

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
	document.head.appendChild(script);
}

/**
 * Fire a Google Ads conversion event after a successful tool action.
 * Call this after a user successfully downloads a processed file.
 * Does nothing if Google Ads is not configured.
 */
export function trackConversion(toolSlug: string): void {
	if (!GOOGLE_ADS_ID || typeof window === 'undefined' || !window.gtag) return;

	window.gtag('event', 'conversion', {
		send_to: GOOGLE_ADS_CONVERSION_LABEL
			? `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`
			: GOOGLE_ADS_ID,
		event_category: 'tool_use',
		event_label: toolSlug,
		value: 1.0,
		currency: 'USD'
	});
}
