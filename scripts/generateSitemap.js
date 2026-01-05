/**
 * Generate Sitemap for SEO Pages
 * 
 * This script generates a comprehensive sitemap.xml file
 * with all pre-created SEO pages for search engine crawling
 */

import { getAllPopularBooks, getAllBookSlugs } from '../src/data/popularBooks.js';
import { getAllCategorySlugs } from '../src/data/categoryBooks.js';
import { getAllSEOTopicSlugs } from '../src/data/seoTopics.js';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://bookreccs.netlify.app';

function generateSitemap() {
    const popularBooks = getAllPopularBooks();
    const bookSlugs = getAllBookSlugs();
    const categories = getAllCategorySlugs();
    const seoTopics = getAllSEOTopicSlugs();
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage -->
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Books Like Index -->
  <url>
    <loc>${BASE_URL}/books-like</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Category Pages -->
`;

    // Add category pages
    categories.forEach(category => {
        const categoryName = category.replace(/-/g, ' ');
        sitemap += `  <url>
    <loc>${BASE_URL}/best-books-for/${category}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add Books Like pages for all popular books
    sitemap += `
  <!-- Books Like X Pages (AI-Recommended Books) -->
`;
    
    bookSlugs.forEach(({ slug, title, seoPriority }) => {
        const priority = seoPriority === 'high' ? '0.9' : '0.8';
        sitemap += `  <url>
    <loc>${BASE_URL}/books-like/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    });

    // Add SEO topic pages
    sitemap += `
  <!-- SEO Topic Pages -->
`;
    
    seoTopics.forEach(topicSlug => {
        sitemap += `  <url>
    <loc>${BASE_URL}/seo-topic/${topicSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;
    
    return sitemap;
}

// Write sitemap to public directory
const sitemapContent = generateSitemap();
const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

const totalUrls = 1 + 1 + getAllCategorySlugs().length + getAllPopularBooks().length + getAllSEOTopicSlugs().length;
console.log(`✅ Generated sitemap.xml with ${getAllPopularBooks().length} Books Like pages`);
console.log(`✅ Added ${getAllCategorySlugs().length} category pages`);
console.log(`✅ Added ${getAllSEOTopicSlugs().length} SEO topic pages`);
console.log(`✅ Total URLs: ${totalUrls}`);
