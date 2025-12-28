# Multi-Source Trending Books Strategy

## Current Situation

### ✅ What You Already Have:
1. **Backend Scrapers** (not currently used by frontend):
   - Waterstones bestseller lists
   - Barnes & Noble bestseller lists
   - Reddit r/books trending posts
   - NYT Bestseller lists

2. **APIs Currently Used**:
   - Google Books API (for metadata)
   - Gemini AI (for recommendations)
   - YouTube API (for videos)

### ❌ What's Missing:
- Frontend doesn't use backend scrapers
- No aggregation of multiple sources
- No regional diversity in scraped sources
- Limited to Western sources

---

## Available Data Sources

### 1. **Official Bestseller Lists** (High Accuracy)
- ✅ **NYT Bestseller API** - Free, official bestseller lists
- ✅ **Google Books Bestsellers** - Can query by category/region
- ✅ **Amazon Bestsellers** - Via Product Advertising API (requires affiliate account)
- ✅ **Bookshop.org** - Independent bookstore bestsellers
- ✅ **Publishers Weekly** - Industry bestseller lists

### 2. **Social Media & Community** (Trending Indicator)
- ✅ **Reddit r/books** - Already scraping this!
- ✅ **Goodreads** - Popular/trending books (limited API, may need scraping)
- ✅ **BookTok (TikTok)** - Can use TikTok API or scrape hashtags
- ✅ **Instagram #BookRecommendations** - Social media trends
- ✅ **Twitter/X** - Book discussions and trends

### 3. **Book Databases** (Metadata & Ratings)
- ✅ **Google Books API** - Already using, has bestseller categories
- ✅ **Open Library API** - Free, comprehensive book data
- ✅ **ISBNdb** - Large database of book metadata
- ✅ **LibraryThing** - Community-driven book data
- ✅ **The StoryGraph** - Alternative to Goodreads with API

### 4. **Regional Sources** (For Diversity)
- **Middle East**: ArabLit, Banipal Magazine recommendations
- **Pakistan**: Dawn Books, Pakistan Book Foundation
- **Malaysia**: Popular Malaysian bookstores, literary awards
- **Japan**: Japanese bestseller lists (translated to English)
- **Korea**: Korean Literature Now, translated works lists

### 5. **Awards & Recognition** (Quality Indicator)
- **Booker Prize** - Literary fiction
- **Pulitzer Prize** - Various categories
- **National Book Award** - US literary awards
- **International awards** - Regional literary prizes

---

## Recommended Multi-Source Strategy

### Phase 1: Use Existing Backend Scrapers

**Action**: Connect frontend to backend API

**Implementation**:
1. Create API endpoint in backend to serve trending books
2. Frontend calls this endpoint instead of just Gemini
3. Combine backend scraped data with AI recommendations

**Code Structure**:
```javascript
// New service: trendingBooks.js
export async function getTrendingBooksFromMultipleSources() {
  // 1. Try backend API first (real data)
  try {
    const backendData = await fetch('/api/trending-books');
    if (backendData.ok) {
      return await backendData.json();
    }
  } catch (error) {
    console.warn('Backend API unavailable, using AI fallback');
  }
  
  // 2. Fallback to AI with enhanced prompt
  return await getTrendingBooksFromAI();
}
```

### Phase 2: Add NYT Bestseller API

**Why**: Official, free, accurate bestseller data

**Implementation**:
```javascript
// New service: nytBooks.js
const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_API_URL = 'https://api.nytimes.com/svc/books/v3';

export async function getNYTBestsellers(listName = 'hardcover-fiction') {
  const response = await fetch(
    `${NYT_API_URL}/lists/current/${listName}.json?api-key=${NYT_API_KEY}`
  );
  const data = await response.json();
  return data.results?.books || [];
}
```

**NYT Lists Available**:
- `hardcover-fiction`
- `hardcover-nonfiction`
- `trade-fiction-paperback`
- `young-adult-hardcover`
- And many more categories

### Phase 3: Enhance Google Books Queries

**Why**: Google Books has bestseller categories we're not using

**Implementation**:
```javascript
// Enhanced googleBooks.js
export async function getGoogleBooksBestsellers(category = 'fiction') {
  const response = await fetch(
    `${GOOGLE_BOOKS_API_URL}?q=subject:${category}&orderBy=relevance&maxResults=20`
  );
  // Filter by high ratings and recent publication
  return processResults(data);
}
```

### Phase 4: Add Open Library API

**Why**: Free, comprehensive, good for regional books

**Implementation**:
```javascript
// New service: openLibrary.js
export async function searchOpenLibrary(query) {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
  );
  return processOpenLibraryResults(data);
}
```

### Phase 5: Aggregate Multiple Sources

**Strategy**: Combine data from multiple sources and score/rank

**Implementation**:
```javascript
// New service: aggregateTrending.js
export async function getAggregatedTrendingBooks() {
  const [nytBooks, googleBestsellers, redditTrending, aiRecommendations] = 
    await Promise.all([
      getNYTBestsellers(),
      getGoogleBooksBestsellers(),
      getRedditTrending(), // From backend
      getTrendingBooksFromAI() // Enhanced with regional diversity
    ]);
  
  // Combine and score books
  const aggregated = combineAndScoreBooks({
    nyt: nytBooks,
    google: googleBestsellers,
    reddit: redditTrending,
    ai: aiRecommendations
  });
  
  // Filter for regional diversity
  return ensureRegionalDiversity(aggregated);
}
```

### Phase 6: Add Regional Sources

**For Middle East, Pakistan, Malaysia, Japan, Korea**:

1. **Scrape Regional Bookstore Websites**:
   - Middle East: Kinokuniya Middle East, Jarir Bookstore
   - Pakistan: Liberty Books, Readings Pakistan
   - Malaysia: Popular Bookstore, MPH Bookstores
   - Japan: Kinokuniya (English section)
   - Korea: Kyobo Book Centre (English section)

2. **Use Literary Awards**:
   - International Prize for Arabic Fiction
   - Man Asian Literary Prize
   - Japanese literary awards (translated works)

3. **Book Review Sites**:
   - ArabLit Quarterly
   - Asian Review of Books
   - Korean Literature Now

---

## Scoring Algorithm

### How to Combine Multiple Sources:

```javascript
function scoreBook(book, sources) {
  let score = 0;
  
  // NYT Bestseller = +30 points (high authority)
  if (sources.nyt) score += 30;
  
  // Google Books high rating = +20 points
  if (sources.google?.rating > 4.5) score += 20;
  
  // Reddit trending = +15 points
  if (sources.reddit?.score > 100) score += 15;
  
  // AI recommendation = +10 points
  if (sources.ai) score += 10;
  
  // Regional diversity bonus = +5 points
  if (isFromTargetRegion(book)) score += 5;
  
  // Recent publication = +5 points
  if (isRecent(book, 2)) score += 5;
  
  return score;
}
```

---

## Implementation Priority

### High Priority (Implement First):
1. ✅ **Connect frontend to existing backend scrapers**
2. ✅ **Add NYT Bestseller API** (free, official, accurate)
3. ✅ **Enhance Google Books queries** (use bestseller categories)

### Medium Priority:
4. **Add Open Library API** (free, good for regional books)
5. **Implement aggregation/scoring system**
6. **Add regional bookstore scrapers**

### Low Priority:
7. **Social media scraping** (BookTok, Instagram)
8. **Awards databases**
9. **Advanced regional sources**

---

## Technical Architecture

### New Service Structure:
```
src/services/
  ├── trendingBooks.js (main aggregator)
  ├── nytBooks.js (NYT API)
  ├── googleBooks.js (enhanced)
  ├── openLibrary.js (new)
  ├── aggregateTrending.js (scoring/combining)
  └── regionalBooks.js (regional sources)
```

### Data Flow:
```
1. Frontend calls getTrendingBooks()
2. Aggregator fetches from multiple sources in parallel
3. Scores and ranks books
4. Filters for regional diversity
5. Verifies availability in Google Books
6. Returns final list
```

---

## API Keys Needed

1. **NYT API** - Free, get from: https://developer.nytimes.com/
2. **Amazon Product Advertising API** - Optional, requires affiliate account
3. **TikTok API** - Optional, for BookTok trends

---

## Benefits of Multi-Source Approach

1. **Accuracy**: Real data from bestseller lists vs. AI guesses
2. **Recency**: Social media shows what's trending NOW
3. **Diversity**: Multiple sources = more diverse recommendations
4. **Reliability**: If one source fails, others still work
5. **Validation**: Cross-reference multiple sources for accuracy
6. **Regional Coverage**: Can target specific regions better

---

## Example: Combined Result

Instead of just AI saying "these 6 books are trending", you get:

- **3 books from NYT Bestseller list** (verified popular)
- **2 books from Reddit r/books** (community trending)
- **1 book from AI** (with regional diversity requirement)
- **All verified** in Google Books
- **All confirmed** available in English
- **Scored and ranked** by popularity across sources

This gives you much more accurate and diverse trending books!

