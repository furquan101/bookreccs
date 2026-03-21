/**
 * Fetch Trending Books — runs in GitHub Actions, no browser APIs.
 *
 * Sources:
 *  - NYT Bestsellers: hardcover-fiction, hardcover-nonfiction, trade-fiction-paperback
 *  - Open Library Covers: free, no API key, high-res by ISBN
 *
 * Writes: public/trending.json
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const NYT_API_KEY = process.env.NYT_API_KEY;
const NYT_API_BASE = 'https://api.nytimes.com/svc/books/v3';
const NYT_LISTS = [
    'hardcover-fiction',
    'hardcover-nonfiction',
    'trade-fiction-paperback',
];

function openLibraryCoverUrl(isbn) {
    if (!isbn) return null;
    return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

async function fetchNYTList(listName) {
    if (!NYT_API_KEY) {
        console.warn('NYT_API_KEY not set — skipping NYT fetch');
        return [];
    }
    try {
        const url = `${NYT_API_BASE}/lists/current/${listName}.json?api-key=${NYT_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`NYT ${listName} returned ${res.status}`);
            return [];
        }
        const data = await res.json();
        if (data.status !== 'OK' || !data.results?.books) return [];

        return data.results.books.map(book => {
            const isbn = book.primary_isbn13 || book.isbn13 || book.primary_isbn10;
            return {
                title: book.title,
                author: book.author,
                isbn,
                cover: openLibraryCoverUrl(isbn),
                coverFallback: book.book_image || null,
                description: book.description || null,
                nytRank: book.rank,
                nytList: listName,
                source: 'nyt',
                // NYT rank 1 gets highest score; list priority: fiction > nonfiction > paperback
                score: 30 + Math.max(0, 15 - book.rank),
            };
        });
    } catch (err) {
        console.error(`Error fetching ${listName}:`, err.message);
        return [];
    }
}

async function main() {
    console.log('Fetching trending books from NYT...');

    const listResults = [];
    for (const listName of NYT_LISTS) {
        const books = await fetchNYTList(listName);
        console.log(`  ${listName}: ${books.length} books`);
        listResults.push(books);
        // Polite delay between NYT requests
        await new Promise(r => setTimeout(r, 600));
    }

    // Deduplicate by ISBN (or title+author if no ISBN)
    const bookMap = new Map();
    listResults.flat().forEach(book => {
        const key = book.isbn || `${book.title.toLowerCase()}-${book.author.toLowerCase()}`;
        if (!bookMap.has(key)) {
            bookMap.set(key, book);
        } else {
            // Keep whichever entry has the higher score
            const existing = bookMap.get(key);
            if (book.score > existing.score) {
                bookMap.set(key, { ...book, nytList: existing.nytList });
            }
        }
    });

    // Sort by score descending, keep top 20 (client picks top 6)
    const books = Array.from(bookMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    if (books.length === 0) {
        console.error('No books fetched — check NYT_API_KEY secret');
        process.exit(1);
    }

    const output = {
        generatedAt: new Date().toISOString(),
        books,
    };

    const outPath = join(__dirname, '..', 'public', 'trending.json');
    writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`✅ Written ${books.length} books to public/trending.json`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
