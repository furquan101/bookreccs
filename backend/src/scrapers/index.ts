import fs from 'fs/promises';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer';
import { scrapeWaterstones } from './waterstones';
import { scrapeBarnesAndNoble } from './barnesandnoble';
import { scrapeReddit } from './reddit';
import { scrapeNYT } from './nyt';
import { TrendingBook, ScrapedBook } from '../types';

const DATA_FILE = path.join(__dirname, '../../data/trending-books.json');

export async function updateTrendingBooks() {
    console.log('Starting scrape...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        // Run scrapers in parallel
        // Note: scrapeReddit and scrapeNYT launch their own browser instances
        const [waterstones, bn, reddit, nyt] = await Promise.all([
            scrapeWaterstones(browser),
            scrapeBarnesAndNoble(browser),
            scrapeReddit(),
            scrapeNYT()
        ]);

        const allScraped: ScrapedBook[] = [...waterstones, ...bn, ...reddit, ...nyt];
        const trendingMap = new Map<string, TrendingBook>();

        for (const book of allScraped) {
            // Normalize title for matching (very basic)
            const key = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');

            if (!trendingMap.has(key)) {
                // Only add pure Reddit books if they have a decent score to avoid noise
                if (book.source === 'REDDIT' && (book.redditScore || 0) < 10) {
                    continue;
                }

                trendingMap.set(key, {
                    title: book.title,
                    author: book.author,
                    score: 0,
                    retailerScore: 0,
                    redditScore: 0,
                    sources: {
                        retailer: [],
                        reddit: []
                    },
                    snapshotDate: new Date().toISOString()
                });
            }

            const entry = trendingMap.get(key);
            if (!entry) continue;

            // Update author if we found a better one
            if (entry.author === 'Unknown' && book.author !== 'Unknown') {
                entry.author = book.author;
            }

            if (book.source === 'REDDIT') {
                entry.sources.reddit.push({
                    subreddit: 'r/books', // Placeholder
                    score: book.redditScore || 0,
                    numComments: book.numComments || 0,
                    url: ''
                });
                // Accumulate Reddit score (capped at 100)
                entry.redditScore = Math.min(100, entry.redditScore + (book.redditScore || 0));
            } else {
                entry.sources.retailer.push({
                    source: book.source,
                    rank: book.rank
                });
            }
        }

        // Calculate scores
        const trendingList = Array.from(trendingMap.values()).map(book => {
            // Retailer Score: 100 - (average rank * 5) + bonus
            let retailerScore = 0;
            let nytScore = 0;

            // Separate NYT from other retailers for specific weighting if needed, 
            // but for now we treat them as "retailer" sources in the type definition.
            // However, we can check the source in the retailer array.

            const nytEntries = book.sources.retailer.filter(r => r.source === 'NYT');
            const otherRetailerEntries = book.sources.retailer.filter(r => r.source !== 'NYT');

            if (nytEntries.length > 0) {
                // NYT Rank 1 = 100, Rank 15 = 30
                const ranks = nytEntries.map(r => r.rank);
                const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
                nytScore = Math.max(0, 100 - ((avgRank - 1) * 5));
            }

            if (otherRetailerEntries.length > 0) {
                const ranks = otherRetailerEntries.map(r => r.rank);
                const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
                let score = Math.max(0, 100 - (avgRank * 5));
                if (otherRetailerEntries.length > 1) score += 20;
                retailerScore = Math.min(100, score);
            }

            book.retailerScore = Math.max(retailerScore, nytScore); // Take the best retailer score for display

            // Final Score: 
            // If NYT is present, it's very authoritative.
            // Formula: 40% Generic Retailer + 40% NYT + 20% Reddit?
            // Or if NYT exists, it dominates?

            // Let's try:
            // Base: Retailer Score (B&N/Waterstones) * 0.4
            // Boost: NYT Score * 0.4
            // Buzz: Reddit Score * 0.2

            // If a book is ONLY on NYT: 0.4 * 100 = 40. Might be too low.
            // Let's adjust: Max(Retailer, NYT) * 0.7 + Reddit * 0.3?
            // But we want to favor NYT.

            // Revised:
            // Score = (RetailerScore * 0.3) + (NYTScore * 0.5) + (RedditScore * 0.2)
            // If a book is on all 3: 30 + 50 + 20 = 100.

            book.score = Math.round(
                (retailerScore * 0.3) +
                (nytScore * 0.5) +
                (book.redditScore * 0.2)
            );

            // Boost if it appears in multiple major sources (e.g. B&N AND NYT)
            if (retailerScore > 0 && nytScore > 0) {
                book.score = Math.min(100, book.score + 15);
            }

            return book;
        });

        // Sort by score
        trendingList.sort((a, b) => b.score - a.score);

        // Ensure data directory exists
        await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

        // Write to file
        await fs.writeFile(DATA_FILE, JSON.stringify(trendingList, null, 2));
        console.log(`Updated trending books. Total: ${trendingList.length}`);

        return trendingList;
    } finally {
        await browser.close();
    }
}

export async function getTrendingBooks(): Promise<TrendingBook[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}
