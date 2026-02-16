import { tools } from '$lib/tools/registry';

export const prerender = true;

export function GET() {
	const base = 'https://htmltopdf.pro';

	const urls = [
		{ loc: base, priority: '1.0', changefreq: 'weekly' },
		...tools.map((tool) => ({
			loc: `${base}/${tool.slug}`,
			priority: '0.8',
			changefreq: 'monthly' as const
		}))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `	<url>
		<loc>${u.loc}</loc>
		<changefreq>${u.changefreq}</changefreq>
		<priority>${u.priority}</priority>
	</url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
}
