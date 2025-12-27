import puppeteer from 'puppeteer';
import { ScrapedBook } from '../types';
import fs from 'fs';
import path from 'path';

export async function scrapeNYT(): Promise<ScrapedBook[]> {
    console.log('Starting NYT scrape...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const books: ScrapedBook[] = [];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // NYT Best Sellers URL
        const url = 'https://www.nytimes.com/books/best-sellers/';
        console.log(`Navigating to ${url}...`);

        // Listen for GraphQL responses
        let graphQLData: any = null;
        page.on('response', async (response) => {
            const request = response.request();
            if (request.url().includes('graphql') && request.method() === 'POST') {
                try {
                    const json = await response.json();
                    // Check if this response contains the best sellers list
                    // Usually look for "lists" or "books" in the data
                    if (JSON.stringify(json).includes('lists')) {
                        console.log('Found GraphQL response with lists!');
                        graphQLData = json;
                    }
                } catch (e) {
                    // Ignore JSON parse errors
                }
            }
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Debug: Screenshot and HTML
        await page.screenshot({ path: 'nyt-debug.png' });

        // If we found GraphQL data, use it
        if (graphQLData) {
            console.log('Extracting books from GraphQL data...');
            // Need to parse the specific structure of NYT GraphQL response
            // Usually data.content.lists or similar
            // For now, let's just log that we found it and try to extract generic structure
            // We might need to inspect the JSON structure in the test output
            console.log('GraphQL Data Keys:', Object.keys(graphQLData.data || {}));

            // Attempt to find lists
            // Structure might be data -> content -> lists
            // Let's try to find any array that looks like a list of books

            // For debugging, write the JSON to a file
            fs.writeFileSync(path.join(__dirname, '../../nyt-graphql.json'), JSON.stringify(graphQLData, null, 2));
        }

        // Fallback to DOM scraping if GraphQL fails or as a backup
        const scrapedBooks = await page.evaluate(() => {
            const results: any[] = [];
            // Try to find any article or list item
            const articles = document.querySelectorAll('li article'); // Common structure

            articles.forEach((article, index) => {
                if (index >= 20) return;

                const titleEl = article.querySelector('h3');
                const authorEl = article.querySelector('p[itemprop="author"]') || article.querySelector('p.css-hjukut'); // Try class name if known

                if (titleEl) {
                    let title = titleEl.textContent?.trim() || '';
                    let author = authorEl?.textContent?.trim() || 'Unknown';
                    author = author.replace(/^by\s+/i, '').trim();

                    results.push({
                        title,
                        author,
                        rank: index + 1,
                        source: 'NYT'
                    });
                }
            });
            return results;
        });

        console.log(`Found ${scrapedBooks.length} books via DOM`);
        if (scrapedBooks.length > 0) {
            books.push(...scrapedBooks);
        } else if (graphQLData) {
            // Parse GraphQL data if DOM failed
            // We need to know the structure. Let's assume we'll inspect the JSON file first.
        }

    } catch (error) {
        console.error('NYT scraper failed:', error);
    } finally {
        await browser.close();
    }

    return books;
}
