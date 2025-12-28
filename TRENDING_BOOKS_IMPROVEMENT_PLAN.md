# Trending Books Section Improvement Plan

## Current Implementation Analysis

### How It Works Now:
1. **AI Generation**: Uses Gemini AI with a generic prompt to generate 6 trending books
2. **Fallback**: Hardcoded list of 5 books if AI fails
3. **Data Fetching**: Fetches book metadata from Google Books API
4. **Display**: Shows books in a horizontal scrollable carousel

### Current Issues:
- ❌ Generic prompt doesn't ensure accuracy or recency
- ❌ No regional diversity (Western-focused)
- ❌ No verification of actual trending status
- ❌ Doesn't specify English translations requirement
- ❌ No mechanism to ensure books are actually available
- ❌ Single source of truth (just AI, no data validation)

---

## Improvement Plan

### Phase 1: Enhanced AI Prompt with Regional Diversity

**Goal**: Make the AI prompt more specific and include diverse regions

**Implementation**:
1. Update `getTrendingBooks()` function in `gemini.js`
2. Create a more detailed prompt that:
   - Specifies regions: Middle East, Pakistan, Malaysia, Japan, Korea
   - Requires English translations only
   - Asks for recent books (last 1-2 years)
   - Requests mix of genres and authors
   - Ensures diversity across regions

**New Prompt Structure**:
```
List 6-8 currently trending or highly popular fiction books from the last 1-2 years.
Requirements:
- Must be available in English (original or translated)
- Include diverse authors from: Middle East, Pakistan, Malaysia, Japan, and Korea
- Mix of genres: literary fiction, contemporary, historical fiction, etc.
- Books should be critically acclaimed, bestsellers, or viral hits
- Prioritize books that have gained international recognition

Respond with ONLY valid JSON in this format:
[
  { "title": "Book Title", "author": "Author Name", "region": "Region Name" },
  ...
]
```

### Phase 2: Multi-Region Book Selection

**Goal**: Ensure balanced representation from each region

**Implementation**:
1. Create a function that requests books by region
2. Combine results to ensure diversity
3. Fallback list should include diverse books:
   - Middle East: "The Kite Runner" (Khaled Hosseini), "A Thousand Splendid Suns"
   - Pakistan: "Home Fire" (Kamila Shamsie), "The Reluctant Fundamentalist" (Mohsin Hamid)
   - Malaysia: "The Garden of Evening Mists" (Tan Twan Eng)
   - Japan: "Convenience Store Woman" (Sayaka Murata), "Before the Coffee Gets Cold" (Toshikazu Kawaguchi)
   - Korea: "The Vegetarian" (Han Kang), "Pachinko" (Min Jin Lee)

### Phase 3: Verification & Filtering

**Goal**: Ensure books are actually available and in English

**Implementation**:
1. After AI generates list, verify each book:
   - Check Google Books API for availability
   - Verify language is English
   - Check if it's a translation (prefer translations if original wasn't English)
   - Filter out books that don't exist or aren't available

2. Add validation function:
```javascript
async function verifyBookAvailability(book) {
  const results = await searchBooks(`${book.title} ${book.author}`);
  if (results.length === 0) return null;
  
  const bookData = results[0];
  // Check if English
  // Check if available
  return bookData;
}
```

### Phase 4: Enhanced Fallback System

**Goal**: Better fallback with diverse, verified books

**Implementation**:
1. Create a curated fallback list with:
   - Books from each target region
   - All verified to exist in Google Books
   - Mix of recent and classic translated works
   - All confirmed to be in English

2. Structure:
```javascript
const DIVERSE_FALLBACK_BOOKS = [
  // Middle East
  { title: "The Kite Runner", author: "Khaled Hosseini", region: "Middle East" },
  { title: "A Thousand Splendid Suns", author: "Khaled Hosseini", region: "Middle East" },
  
  // Pakistan
  { title: "Home Fire", author: "Kamila Shamsie", region: "Pakistan" },
  { title: "The Reluctant Fundamentalist", author: "Mohsin Hamid", region: "Pakistan" },
  
  // Malaysia
  { title: "The Garden of Evening Mists", author: "Tan Twan Eng", region: "Malaysia" },
  
  // Japan
  { title: "Convenience Store Woman", author: "Sayaka Murata", region: "Japan" },
  { title: "Before the Coffee Gets Cold", author: "Toshikazu Kawaguchi", region: "Japan" },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", region: "Japan" },
  
  // Korea
  { title: "The Vegetarian", author: "Han Kang", region: "Korea" },
  { title: "Pachinko", author: "Min Jin Lee", region: "Korea" },
  { title: "If I Had Your Face", author: "Frances Cha", region: "Korea" },
];
```

### Phase 5: Caching & Refresh Strategy

**Goal**: Reduce API calls and improve performance

**Implementation**:
1. Cache trending books for 24 hours
2. Store in localStorage or sessionStorage
3. Refresh mechanism that updates daily
4. Background refresh to keep data current

### Phase 6: UI Enhancement (Optional)

**Goal**: Show region diversity to users

**Implementation**:
1. Add region badges to book cards
2. Filter/tab system to view by region
3. "Diverse reads" indicator

---

## Implementation Priority

### High Priority (Must Have):
1. ✅ Enhanced AI prompt with regional requirements
2. ✅ Verification system for book availability
3. ✅ Diverse fallback list

### Medium Priority (Should Have):
4. Multi-region book selection logic
5. Caching mechanism

### Low Priority (Nice to Have):
6. UI enhancements with region badges
7. Filter by region feature

---

## Technical Implementation Steps

1. **Update `getTrendingBooks()` function**:
   - Modify prompt to include regional diversity
   - Add region field to response

2. **Create verification function**:
   - `verifyBookAvailability()` - checks Google Books
   - Filters for English language
   - Returns null if not available

3. **Update TrendingSection component**:
   - Add verification step after AI generation
   - Use diverse fallback if needed
   - Handle edge cases gracefully

4. **Create diverse fallback list**:
   - Curated list of verified books
   - Organized by region
   - All confirmed available in English

5. **Add error handling**:
   - Graceful degradation
   - User-friendly error messages
   - Fallback always works

---

## Success Metrics

- ✅ At least 1-2 books from each target region
- ✅ All books verified to exist in Google Books
- ✅ All books confirmed to be in English
- ✅ Mix of recent (1-2 years) and established works
- ✅ Improved accuracy vs. current generic approach

---

## Example Enhanced Prompt

```
You are a book recommendation expert. List 8 currently trending or highly popular fiction books from the last 1-2 years that meet these criteria:

REGIONAL DIVERSITY (REQUIRED):
- Include at least 1-2 books from each region: Middle East, Pakistan, Malaysia, Japan, Korea
- Authors should be from these regions or write about these regions

LANGUAGE REQUIREMENT:
- All books MUST be available in English (original or translated)
- Prioritize English translations of originally non-English works

QUALITY CRITERIA:
- Bestsellers, critically acclaimed, or viral hits
- Books that have gained international recognition
- Mix of genres: literary fiction, contemporary, historical fiction, magical realism

Respond with ONLY valid JSON in this format:
[
  { "title": "Book Title", "author": "Author Name", "region": "Region Name", "isTranslated": true/false },
  ...
]

Ensure diversity across regions and include books that are actually trending in 2024-2025.
```

