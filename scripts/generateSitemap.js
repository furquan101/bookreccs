/**
 * Generate Sitemap for SEO Pages
 *
 * Run with: npm run generate-sitemap
 * Writes: public/sitemap.xml
 *
 * Priority scheme:
 *   1.0  Homepage
 *   0.9  Books Like index, high-priority book pages
 *   0.8  Category pages, medium-priority book pages, high-volume SEO topics (searchVolume >= 35)
 *   0.7  Low-volume SEO topics (searchVolume < 35)
 *
 * lastmod dates:
 *   Homepage / Books Like index: today (re-run keeps them current)
 *   Category pages:              today
 *   Book pages:                  2026-03-21 (last content refresh)
 *   SEO topic pages:             2026-03-21
 */

import { getAllPopularBooks, getAllBookSlugs } from '../src/data/popularBooks.js';
import { getAllCategorySlugs } from '../src/data/categoryBooks.js';
import { getAllSEOTopicSlugs, seoTopics } from '../src/data/seoTopics.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://bookreccs.ink';
const TODAY = new Date().toISOString().slice(0, 10);          // e.g. 2026-04-04
const CONTENT_DATE = '2026-03-21';   // last time book/topic content was refreshed

function url(loc, lastmod, changefreq, priority) {
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
}

function generateSitemap() {
    const bookSlugs = getAllBookSlugs();
    const categories = getAllCategorySlugs();
    const topicSlugs = getAllSEOTopicSlugs();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
${url(`${BASE_URL}/`, TODAY, 'daily', '1.0')}
  <!-- Books Like Index -->
${url(`${BASE_URL}/books-like`, TODAY, 'weekly', '0.9')}
  <!-- Category Pages -->
`;

    categories.forEach(category => {
        sitemap += url(`${BASE_URL}/best-books-for/${category}`, TODAY, 'monthly', '0.8');
    });

    sitemap += `\n  <!-- Books Like X Pages -->\n`;
    bookSlugs.forEach(({ slug, seoPriority }) => {
        const priority = seoPriority === 'high' ? '0.9' : '0.8';
        sitemap += url(`${BASE_URL}/books-like/${slug}`, CONTENT_DATE, 'monthly', priority);
    });

    sitemap += `\n  <!-- SEO Topic Pages -->\n`;
    topicSlugs.forEach(topicSlug => {
        const topic = seoTopics[topicSlug];
        // Higher search volume = higher priority
        const priority = topic?.searchVolume >= 35 ? '0.8' : '0.7';
        sitemap += url(`${BASE_URL}/seo-topic/${topicSlug}`, CONTENT_DATE, 'monthly', priority);
    });

    sitemap += `</urlset>\n`;
    return sitemap;
}

const sitemapContent = generateSitemap();
const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, sitemapContent, 'utf8');

const bookCount = getAllBookSlugs().length;
const catCount = getAllCategorySlugs().length;
const topicCount = getAllSEOTopicSlugs().length;
const total = 2 + catCount + bookCount + topicCount;

console.log(`✅ Generated sitemap.xml`);
console.log(`   Homepage + Books Like index: 2`);
console.log(`   Category pages:             ${catCount}`);
console.log(`   Books Like X pages:         ${bookCount}`);
console.log(`   SEO topic pages:            ${topicCount}`);
console.log(`   Total URLs:                 ${total}`);
console.log(`   Written to: ${outPath}`);
