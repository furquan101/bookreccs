import { Browser } from 'puppeteer';
import { ScrapedBook } from '../types';

export async function scrapeBarnesAndNoble(browser: Browser): Promise<ScrapedBook[]> {
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto('https://www.barnesandnoble.com/b/books/bestsellers/_/N-1fZ29Z8q8', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Save HTML to check selectors
        const html = await page.content();
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.join(__dirname, '../../bn-debug.html'), html);

        const books = await page.evaluate(() => {
            // The structure seems to be:
            // <div class="product-shelf-title">
            //   <h3 class="product-info-title"><a ...>Title</a></h3>
            //   <div class="product-shelf-author ...">by <a ...>Author</a></div>
            // </div>
            const items = document.querySelectorAll('.product-shelf-title');
            const results: any[] = [];

            items.forEach((item, index) => {
                if (index >= 10) return;

                const titleEl = item.querySelector('.product-info-title a') || item.querySelector('a');
                // Author is likely a sibling or in the same parent container
                const container = item.parentElement;
                const authorEl = container?.querySelector('.product-shelf-author');

                if (titleEl) {
                    let author = authorEl?.textContent?.trim() || 'Unknown';
                    // Clean up "by " prefix and newlines
                    author = author.replace(/^by\s+/i, '').trim();

                    results.push({
                        title: titleEl.textContent?.trim() || '',
                        author: author,
                        rank: index + 1,
                        source: 'BARNES_NOBLE'
                    });
                }
            });
            return results;
        });

        await page.close();
        return books;
    } catch (error) {
        console.error('Error scraping Barnes & Noble:', error);
        return [];
    }
}
