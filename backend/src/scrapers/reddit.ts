import puppeteer from 'puppeteer';
import { ScrapedBook } from '../types';
import fs from 'fs';
import path from 'path';

export async function scrapeReddit(): Promise<ScrapedBook[]> {
    console.log('Starting Reddit scrape...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const books: ScrapedBook[] = [];
    const subreddits = ['books', 'suggestmeabook', 'BookTok'];

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        for (const sub of subreddits) {
            console.log(`Scraping r/${sub}...`);
            try {
                await page.goto(`https://www.reddit.com/r/${sub}/top/?t=week`, { waitUntil: 'domcontentloaded', timeout: 30000 });

                // Scroll to load more posts
                for (let i = 0; i < 3; i++) {
                    await page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // Wait for posts to load
                await page.waitForSelector('shreddit-post', { timeout: 10000 }).catch(() => console.log(`No posts found for r/${sub}`));

                const posts = await page.evaluate(() => {
                    const results: { title: string, score: number, comments: number }[] = [];

                    // Try finding titles via slot (Light DOM)
                    const titleElements = document.querySelectorAll('a[slot="title"]');

                    titleElements.forEach((el) => {
                        const title = el.textContent?.trim() || '';
                        const post = el.closest('shreddit-post');
                        const score = parseInt(post?.getAttribute('score') || '0', 10);
                        const comments = parseInt(post?.getAttribute('comment-count') || '0', 10);

                        if (title) {
                            results.push({ title, score, comments });
                        }
                    });

                    // Fallback to shreddit-post attributes if slot method fails
                    if (results.length === 0) {
                        const items = document.querySelectorAll('shreddit-post');
                        items.forEach((item) => {
                            const title = item.getAttribute('post-title')?.trim() || '';
                            const score = parseInt(item.getAttribute('score') || '0', 10);
                            const comments = parseInt(item.getAttribute('comment-count') || '0', 10);

                            if (title) {
                                results.push({ title, score, comments });
                            }
                        });
                    }
                    return results;
                });

                for (const post of posts) {
                    const potentialTitles = extractBookTitles(post.title);
                    if (potentialTitles.length === 0) {
                        // console.log('No book title found in:', post.title);
                    }

                    for (const title of potentialTitles) {
                        // Calculate a "buzz" score based on upvotes and comments
                        // Cap it to avoid skewing the total too much
                        const buzzScore = Math.min((post.score * 0.5) + (post.comments * 1), 100);

                        books.push({
                            title: title,
                            author: 'Unknown', // Hard to extract reliably from Reddit titles alone
                            rank: 0, // Not ranked in the same way as retailer lists
                            source: 'REDDIT',
                            redditScore: buzzScore,
                            numComments: post.comments
                        });
                    }
                }

            } catch (error) {
                console.error(`Error scraping r/${sub}:`, error);
            }
        }

    } catch (error) {
        console.error('Reddit scraper failed:', error);
    } finally {
        await browser.close();
    }

    return books;
}

function extractBookTitles(text: string): string[] {
    const titles: string[] = [];

    // Pattern 1: "Title" by Author (e.g., "Project Hail Mary" by Andy Weir)
    const byMatch = text.match(/"([^"]+)"\s+by\s+/i) || text.match(/'([^']+)'\s+by\s+/i);
    if (byMatch) titles.push(byMatch[1]);

    // Pattern 2: Title - Author (heuristic, assumes title is the first part)
    // This is risky, so we only take it if it looks "book-ish" (capitalized words)
    // const dashMatch = text.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+-\s+/);
    // if (dashMatch) titles.push(dashMatch[1]);

    // Pattern 3: Just quoted text if it looks like a title (3-10 words)
    const quoteMatches = text.matchAll(/"([^"]+)"/g);
    for (const match of quoteMatches) {
        const words = match[1].split(' ').length;
        if (words >= 1 && words <= 10) {
            titles.push(match[1]);
        }
    }

    return [...new Set(titles)]; // Deduplicate
}
