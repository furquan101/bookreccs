export type RetailerSource = "BARNES_NOBLE" | "WATERSTONES" | "WHSMITH" | "NYT" | "REDDIT";

export interface ScrapedBook {
    title: string;
    author: string;
    rank: number;
    source: RetailerSource;
    isbn13?: string | null;
    raw?: any;
    redditScore?: number;
    numComments?: number;
}

export interface RetailerEntry {
    source: RetailerSource;
    rank: number;
}

export interface RedditEntry {
    subreddit: string;
    score: number;
    numComments: number;
    url: string;
}

export interface TrendingBook {
    title: string;
    author: string;
    isbn13?: string | null;
    score: number;          // 0–100 overall trending score
    retailerScore: number;  // 0–100 based on bestseller ranks
    redditScore: number;    // 0–100 based on Reddit buzz (initially 0)
    sources: {
        retailer: RetailerEntry[];
        reddit: RedditEntry[];
    };
    snapshotDate: string; // ISO string
}
