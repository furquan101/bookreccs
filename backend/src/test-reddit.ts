import { scrapeReddit } from './scrapers/reddit';

async function test() {
    console.log('Testing Reddit scraper...');
    const books = await scrapeReddit();
    console.log('Scraped books:', JSON.stringify(books, null, 2));
}

test();
