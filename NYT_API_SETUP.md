# NYT Books API Setup Guide

## Where to Get NYT API Key

### Step 1: Visit NYT Developer Portal
**URL**: https://developer.nytimes.com/

### Step 2: Create an Account
1. Click "Get Started" or "Sign Up"
2. Create a free account (email verification required)
3. Log in to your account

### Step 3: Create an App
1. Go to "My Apps" section
2. Click "Create App" or "+ New App"
3. Fill in the form:
   - **App Name**: "Book Reccs" (or any name you prefer)
   - **App Type**: Select "Web App" or "Single Page App"
   - **Description**: "Book recommendation app using NYT Bestseller lists"
   - **Website URL**: Your site URL (e.g., https://bookreccs.netlify.app)

### Step 4: Get Your API Key
1. After creating the app, you'll see your API key
2. Copy the API key (it looks like: `AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`)
3. **Important**: Keep this key secure and don't commit it to git

### Step 5: Add to Environment Variables

#### For Local Development:
Add to your `.env` file:
```
VITE_NYT_API_KEY=your_api_key_here
```

#### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add new variable:
   - **Key**: `VITE_NYT_API_KEY`
   - **Value**: Your NYT API key
5. Click "Save"
6. **Redeploy** your site for changes to take effect

## API Limits

### Free Tier:
- **Rate Limit**: 4,000 requests per day
- **Rate Limit**: 10 requests per minute
- **Cost**: FREE
- **Perfect for**: Personal projects, small apps

### Paid Tier (if needed):
- Higher rate limits
- Priority support
- Contact NYT for pricing

## Available NYT Books API Endpoints

### Bestseller Lists:
```
https://api.nytimes.com/svc/books/v3/lists/current/{list-name}.json?api-key={your-api-key}
```

### Available Lists:
- `hardcover-fiction`
- `hardcover-nonfiction`
- `trade-fiction-paperback`
- `mass-market-paperback`
- `young-adult-hardcover`
- `picture-books`
- `series-books`
- `e-book-fiction`
- `e-book-nonfiction`
- And many more...

### Example Request:
```javascript
const response = await fetch(
  `https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=${API_KEY}`
);
```

## Response Format

The API returns data in this format:
```json
{
  "status": "OK",
  "copyright": "Copyright (c) 2024 The New York Times Company",
  "num_results": 15,
  "results": {
    "list_name": "Hardcover Fiction",
    "bestsellers_date": "2024-01-15",
    "published_date": "2024-01-21",
    "books": [
      {
        "rank": 1,
        "title": "Book Title",
        "author": "Author Name",
        "isbn13": "9781234567890",
        "description": "Book description...",
        "book_image": "https://...",
        "amazon_product_url": "https://..."
      }
    ]
  }
}
```

## Quick Start Code

Once you have your API key, you can use it like this:

```javascript
// src/services/nytBooks.js
const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY;
const NYT_API_BASE = 'https://api.nytimes.com/svc/books/v3';

export async function getNYTBestsellers(listName = 'hardcover-fiction') {
  if (!NYT_API_KEY) {
    console.warn('NYT API key not found');
    return [];
  }

  try {
    const response = await fetch(
      `${NYT_API_BASE}/lists/current/${listName}.json?api-key=${NYT_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`NYT API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results?.books) {
      return [];
    }
    
    return data.results.books.map(book => ({
      title: book.title,
      author: book.author,
      isbn: book.isbn13,
      cover: book.book_image,
      description: book.description,
      rank: book.rank,
      source: 'nyt'
    }));
  } catch (error) {
    console.error('Error fetching NYT bestsellers:', error);
    return [];
  }
}
```

## Important Notes

1. **Free Tier is Generous**: 4,000 requests/day is plenty for most apps
2. **Rate Limiting**: Be respectful - don't make excessive requests
3. **Caching Recommended**: Cache results to reduce API calls
4. **Keep Key Secret**: Never commit API keys to git
5. **Terms of Service**: Read and follow NYT's API terms

## Troubleshooting

### "Invalid API Key" Error:
- Check that you copied the full key
- Verify key is in `.env` file (local) or Netlify environment variables
- Make sure variable name is exactly `VITE_NYT_API_KEY`

### "Rate Limit Exceeded":
- You've hit the 10 requests/minute limit
- Wait a minute and try again
- Implement caching to reduce requests

### "403 Forbidden":
- Check your API key is correct
- Verify your app is approved (usually instant for free tier)
- Check if you're using the correct endpoint URL

## Next Steps

After getting your API key:
1. Add it to `.env` file (local) and Netlify (production)
2. I can help integrate it into the trending books aggregator
3. We can add NYT bestseller lists as another data source
4. This will make trending books even more accurate!

