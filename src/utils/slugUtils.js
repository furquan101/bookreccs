/**
 * Utility functions for converting between book titles and URL slugs
 */

/**
 * Convert a book title to a URL-friendly slug
 * Example: "Atomic Habits" -> "atomic-habits"
 */
export function titleToSlug(title) {
    if (!title) return '';
    
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-')       // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Convert a slug back to a title (capitalize words)
 * Example: "atomic-habits" -> "Atomic Habits"
 */
export function slugToTitle(slug) {
    if (!slug) return '';
    
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
