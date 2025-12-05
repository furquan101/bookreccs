const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Simple in-memory cache to reduce API calls
const videoCache = new Map();

/**
 * Search for YouTube videos about a specific book
 * @param {string} bookTitle - The title of the book
 * @param {string} author - The author of the book
 * @param {number} maxResults - Maximum number of results to return (default: 6)
 * @returns {Promise<Array>} Array of video objects
 */
export async function searchBookVideos(bookTitle, author, maxResults = 6) {
    if (!YOUTUBE_API_KEY) {
        console.warn('YouTube API key not found');
        return [];
    }

    const cacheKey = `${bookTitle}-${author}`;

    // Check cache first
    if (videoCache.has(cacheKey)) {
        return videoCache.get(cacheKey);
    }

    try {
        // Search query optimized specifically for book reviews and summaries
        const query = `"${bookTitle}" "${author}" book review`;

        const searchParams = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            order: 'viewCount', // Sort by popularity
            maxResults: maxResults.toString(),
            key: YOUTUBE_API_KEY,
            videoDuration: 'any',
            relevanceLanguage: 'en',
            safeSearch: 'moderate'
        });

        const searchResponse = await fetch(
            `${YOUTUBE_API_BASE}/search?${searchParams}`
        );

        if (!searchResponse.ok) {
            throw new Error(`YouTube API error: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            return [];
        }

        // Get video IDs for statistics request
        const videoIds = searchData.items.map(item => item.id.videoId).join(',');

        // Fetch video statistics (views, likes, etc.)
        const statsParams = new URLSearchParams({
            part: 'statistics,contentDetails',
            id: videoIds,
            key: YOUTUBE_API_KEY
        });

        const statsResponse = await fetch(
            `${YOUTUBE_API_BASE}/videos?${statsParams}`
        );

        if (!statsResponse.ok) {
            throw new Error(`YouTube API error: ${statsResponse.status}`);
        }

        const statsData = await statsResponse.json();

        // Combine search results with statistics
        const videos = searchData.items.map((item, index) => {
            const stats = statsData.items[index]?.statistics || {};
            const contentDetails = statsData.items[index]?.contentDetails || {};

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                channelTitle: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                viewCount: parseInt(stats.viewCount || 0),
                likeCount: parseInt(stats.likeCount || 0),
                duration: contentDetails.duration || '',
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`
            };
        });

        // Filter out videos with very low view counts (likely not viral/quality content)
        const filteredVideos = videos.filter(video => video.viewCount > 1000);

        // Cache the results
        videoCache.set(cacheKey, filteredVideos);

        return filteredVideos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}

/**
 * Format view count to human-readable string
 * @param {number} count - The view count
 * @returns {string} Formatted view count (e.g., "1.2M", "45K")
 */
export function formatViewCount(count) {
    if (count >= 1000000) {
        return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
}

/**
 * Parse ISO 8601 duration to human-readable format
 * @param {string} duration - ISO 8601 duration string (e.g., "PT4M13S")
 * @returns {string} Formatted duration (e.g., "4:13")
 */
export function formatDuration(duration) {
    if (!duration) return '';

    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) {
        return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } else if (minutes) {
        return `${minutes}:${seconds.padStart(2, '0')}`;
    } else {
        return `0:${seconds.padStart(2, '0')}`;
    }
}
