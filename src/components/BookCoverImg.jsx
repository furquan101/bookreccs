import { useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * BookCoverImg - handles a 3-level image fallback chain:
 *
 * 1. `src`         — Open Library large cover (e.g. -L.jpg via ISBN)
 * 2. `fallbackSrc` — Enhanced Google Books URL (zoom=0, no curl, HTTPS)
 * 3. icon          — <BookOpen> icon when both sources fail or return a 1x1 placeholder
 *
 * Open Library returns a 1×1 transparent GIF instead of a 404 when a cover
 * doesn't exist, so we detect it via naturalWidth in the onLoad handler.
 */
export default function BookCoverImg({
    src,
    fallbackSrc,
    alt,
    className = '',
    iconClassName = '',
    loading = 'lazy',
    fetchPriority,
    style,
}) {
    const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc || null);
    const [usedFallback, setUsedFallback] = useState(!src && !!fallbackSrc);
    const [showIcon, setShowIcon] = useState(!src && !fallbackSrc);

    const handleLoad = useCallback((e) => {
        // Open Library returns a 1x1 placeholder when no cover exists
        if (e.target.naturalWidth <= 1) {
            if (!usedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
                setCurrentSrc(fallbackSrc);
                setUsedFallback(true);
            } else {
                setShowIcon(true);
            }
        }
    }, [usedFallback, fallbackSrc, currentSrc]);

    const handleError = useCallback(() => {
        if (!usedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
            setCurrentSrc(fallbackSrc);
            setUsedFallback(true);
        } else {
            setShowIcon(true);
        }
    }, [usedFallback, fallbackSrc, currentSrc]);

    if (showIcon || !currentSrc) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${iconClassName || className}`}>
                <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={alt}
            className={className}
            loading={loading}
            fetchPriority={fetchPriority}
            style={style}
            onLoad={handleLoad}
            onError={handleError}
        />
    );
}
