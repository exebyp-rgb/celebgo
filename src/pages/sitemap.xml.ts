import type { APIRoute } from 'astro';
import { getAllEvents, getAllCities, getAllArtists } from '../lib/data';

export const GET: APIRoute = async () => {
    const events = await getAllEvents();
    const cities = await getAllCities();
    const artists = await getAllArtists();
    const site = 'https://celebgo.com';

    const pages = [
        site,
        ...events.map((e) => `${site}/events/${e.slug}`),
        ...cities.map((c) => `${site}/city/${c.slug}`),
        ...artists.map((a) => `${site}/artist/${a.slug}`),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
            .map(
                (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>`
            )
            .join('\n')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
};
