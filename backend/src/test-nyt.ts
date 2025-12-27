import { scrapeNYT } from './scrapers/nyt';

async function test() {
    console.log('Testing NYT scraper...');
    const books = await scrapeNYT();
    console.log('Scraped books:', JSON.stringify(books, null, 2));
}

test();
