import { Browser } from 'puppeteer';
import { ScrapedBook } from '../types';

export async function scrapeWaterstones(browser: Browser): Promise<ScrapedBook[]> {
    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Waterstones often uses 'bestsellers' or 'campaign/bestsellers'
        await page.goto('https://www.waterstones.com/books/bestsellers', { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Scroll to bottom to trigger lazy loading
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Wait a bit for content to settle
        await new Promise(r => setTimeout(r, 5000));

        // Take a screenshot to debug what the page looks like
        await page.screenshot({ path: 'waterstones-debug.png' });

        // Save HTML to check selectors
        const html = await page.content();
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(path.join(__dirname, '../../waterstones-debug.html'), html);

        const books = await page.evaluate(() => {
            // 'book-item' might not be the class, so we target the title directly
            // and find the author relative to it.
            const titles = document.querySelectorAll('a.title');
            const results: any[] = [];

            titles.forEach((titleEl, index) => {
                if (index >= 10) return;

                // Title is in div.title-wrap. Author is usually a sibling of title-wrap or in the same parent.
                // We try to go up to the common container.
                // Structure:
                // <div class="book-thumb ..."> (or similar)
                //   <div class="title-wrap"><a class="title ...">...</a></div>
                //   <a class="text-author ...">...</a>
                // </div>
                const container = titleEl.closest('div')?.parentElement;
                const authorEl = container?.querySelector('.text-author');

                if (titleEl) {
                    results.push({
                        title: titleEl.textContent?.trim() || '',
                        author: authorEl?.textContent?.trim() || 'Unknown',
                        rank: index + 1,
                        source: 'WATERSTONES'
                    });
                }
            });
            return results;
        });

        await page.close();
        return books;
    } catch (error) {
        console.error('Error scraping Waterstones:', error);
        return [];
    }
}
